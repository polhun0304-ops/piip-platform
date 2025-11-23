"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveObject = saveObject;
exports.isS3Enabled = isS3Enabled;
exports.parseS3Url = parseS3Url;
exports.getS3SignedUrl = getS3SignedUrl;
exports.getS3ObjectStream = getS3ObjectStream;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
// Optional S3 support via AWS SDK v3
let S3ClientCtor = null;
let PutObjectCommandCtor = null;
let GetObjectCommandCtor = null;
let HeadObjectCommandCtor = null;
let getSignedUrlFn = null;
try {
    // Dynamically require to avoid hard dependency if not used
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const aws = require("@aws-sdk/client-s3");
    S3ClientCtor = aws.S3Client;
    PutObjectCommandCtor = aws.PutObjectCommand;
    GetObjectCommandCtor = aws.GetObjectCommand;
    HeadObjectCommandCtor = aws.HeadObjectCommand;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const presigner = require("@aws-sdk/s3-request-presigner");
        getSignedUrlFn = presigner.getSignedUrl;
    }
    catch (_) {
        // ignore if not installed
    }
}
catch (_) {
    // ignore if not installed
}
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "local"; // 'local' | 's3'
const UPLOADS_ROOT = path_1.default.join(__dirname, "..", "uploads");
async function saveObject({ buffer, stream, filename, caseId, contentType, }) {
    const safeBase = (filename || "object.bin").replace(/[^a-zA-Z0-9-_.]+/g, "_");
    const finalName = `${Date.now()}_${(0, crypto_1.randomUUID)()}_${safeBase}`;
    const folder = caseId ? caseId.replace(/[^a-zA-Z0-9-_]+/g, "_") : undefined;
    if (STORAGE_PROVIDER === "s3") {
        if (!S3ClientCtor || !PutObjectCommandCtor) {
            throw new Error("S3 storage selected but @aws-sdk/client-s3 is not installed");
        }
        const bucket = process.env.S3_BUCKET;
        const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
        if (!bucket)
            throw new Error("S3_BUCKET env is required for s3 storage");
        const prefix = process.env.S3_PREFIX || "evidence";
        const key = `${prefix}/${folder ? folder + "/" : ""}${finalName}`;
        const s3 = new S3ClientCtor({ region });
        const Body = buffer || stream;
        if (!Body)
            throw new Error("No buffer/stream provided to save");
        const cmd = new PutObjectCommandCtor({
            Bucket: bucket,
            Key: key,
            Body,
            ContentType: contentType,
        });
        await s3.send(cmd);
        // Prefer CDN/public base if provided, fallback to s3:// notation
        const publicBase = process.env.S3_PUBLIC_URL_BASE;
        const urlOrPath = publicBase
            ? `${publicBase.replace(/\/$/, "")}/${key}`
            : `s3://${bucket}/${key}`;
        return { urlOrPath, key };
    }
    // Local disk
    const destDir = folder ? path_1.default.join(UPLOADS_ROOT, folder) : UPLOADS_ROOT;
    fs_1.default.mkdirSync(destDir, { recursive: true });
    const filePath = path_1.default.join(destDir, finalName);
    if (buffer) {
        await fs_1.default.promises.writeFile(filePath, buffer);
    }
    else if (stream) {
        await new Promise((resolve, reject) => {
            stream
                .pipe(fs_1.default.createWriteStream(filePath))
                .on("finish", resolve)
                .on("error", reject);
        });
    }
    else {
        throw new Error("No buffer/stream provided to save");
    }
    const relative = `/${path_1.default
        .relative(path_1.default.join(__dirname, ".."), filePath)
        .split(path_1.default.sep)
        .join("/")}`; // "/uploads/..."
    return { urlOrPath: relative, key: filePath };
}
function isS3Enabled() {
    return STORAGE_PROVIDER === "s3";
}
function parseS3Url(urlOrPath) {
    if (!urlOrPath)
        return null;
    if (urlOrPath.startsWith("s3://")) {
        const without = urlOrPath.slice(5);
        const firstSlash = without.indexOf("/");
        if (firstSlash === -1)
            return null;
        const bucket = without.slice(0, firstSlash);
        const key = without.slice(firstSlash + 1);
        return { bucket, key };
    }
    return null;
}
async function getS3SignedUrl(params) {
    if (!S3ClientCtor || !GetObjectCommandCtor || !getSignedUrlFn) {
        throw new Error("S3 presigner not available: missing dependencies");
    }
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
    const s3 = new S3ClientCtor({ region });
    const cmd = new GetObjectCommandCtor({
        Bucket: params.bucket,
        Key: params.key,
    });
    const url = await getSignedUrlFn(s3, cmd, {
        expiresIn: params.expiresIn ?? 300,
    });
    return url;
}
async function getS3ObjectStream(params) {
    if (!S3ClientCtor || !GetObjectCommandCtor) {
        throw new Error("S3 client not available");
    }
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
    const s3 = new S3ClientCtor({ region });
    const cmd = new GetObjectCommandCtor({
        Bucket: params.bucket,
        Key: params.key,
    });
    const out = await s3.send(cmd);
    const stream = out.Body;
    const contentType = out.ContentType;
    const contentLength = out.ContentLength;
    return { stream, contentType, contentLength };
}
