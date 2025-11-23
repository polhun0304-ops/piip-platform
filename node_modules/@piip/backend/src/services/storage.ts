import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { Readable } from "stream";

// Optional S3 support via AWS SDK v3
type SimpleS3 = { send(cmd: unknown): Promise<unknown> };

let S3ClientCtor: (new (...args: unknown[]) => SimpleS3) | null = null;
let PutObjectCommandCtor: (new (...args: unknown[]) => unknown) | null = null;
let GetObjectCommandCtor: (new (...args: unknown[]) => unknown) | null = null;
let getSignedUrlFn: ((...args: unknown[]) => Promise<string>) | null = null;
try {
  // Dynamically require to avoid hard dependency if not used
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const aws = require("@aws-sdk/client-s3");
  S3ClientCtor = aws.S3Client;
  PutObjectCommandCtor = aws.PutObjectCommand;
  GetObjectCommandCtor = aws.GetObjectCommand;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const presigner = require("@aws-sdk/s3-request-presigner");
    getSignedUrlFn = presigner.getSignedUrl;
  } catch (_) {
    // ignore if not installed
  }
} catch (_) {
  // ignore if not installed
}

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "local"; // 'local' | 's3'
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

type SaveInput = {
  buffer?: Buffer;
  stream?: Readable;
  filename?: string;
  caseId?: string;
  contentType?: string;
};

export async function saveObject({
  buffer,
  stream,
  filename,
  caseId,
  contentType,
}: SaveInput): Promise<{ urlOrPath: string; key: string }> {
  const safeBase = (filename || "object.bin").replace(/[^a-zA-Z0-9-_.]+/g, "_");
  const finalName = `${Date.now()}_${randomUUID()}_${safeBase}`;
  const folder = caseId ? caseId.replace(/[^a-zA-Z0-9-_]+/g, "_") : undefined;

  if (STORAGE_PROVIDER === "s3") {
    if (!S3ClientCtor || !PutObjectCommandCtor) {
      throw new Error(
        "S3 storage selected but @aws-sdk/client-s3 is not installed"
      );
    }
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
    if (!bucket) throw new Error("S3_BUCKET env is required for s3 storage");
    const prefix = process.env.S3_PREFIX || "evidence";
    const key = `${prefix}/${folder ? folder + "/" : ""}${finalName}`;

    const s3 = new S3ClientCtor({ region });
    const Body = buffer || stream;
    if (!Body) throw new Error("No buffer/stream provided to save");
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
  const destDir = folder ? path.join(UPLOADS_ROOT, folder) : UPLOADS_ROOT;
  fs.mkdirSync(destDir, { recursive: true });
  const filePath = path.join(destDir, finalName);
  if (buffer) {
    await fs.promises.writeFile(filePath, buffer);
  } else if (stream) {
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(fs.createWriteStream(filePath))
        .on("finish", resolve)
        .on("error", reject);
    });
  } else {
    throw new Error("No buffer/stream provided to save");
  }
  const relative = `/${path
    .relative(path.join(__dirname, ".."), filePath)
    .split(path.sep)
    .join("/")}`; // "/uploads/..."
  return { urlOrPath: relative, key: filePath };
}

export function isS3Enabled(): boolean {
  return STORAGE_PROVIDER === "s3";
}

export function parseS3Url(
  urlOrPath: string
): { bucket: string; key: string } | null {
  if (!urlOrPath) return null;
  if (urlOrPath.startsWith("s3://")) {
    const without = urlOrPath.slice(5);
    const firstSlash = without.indexOf("/");
    if (firstSlash === -1) return null;
    const bucket = without.slice(0, firstSlash);
    const key = without.slice(firstSlash + 1);
    return { bucket, key };
  }
  return null;
}

export async function getS3SignedUrl(params: {
  bucket: string;
  key: string;
  expiresIn?: number;
}): Promise<string> {
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

export async function getS3ObjectStream(params: {
  bucket: string;
  key: string;
}): Promise<{
  stream: Readable;
  contentType?: string;
  contentLength?: number;
}> {
  if (!S3ClientCtor || !GetObjectCommandCtor) {
    throw new Error("S3 client not available");
  }
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  const s3 = new S3ClientCtor({ region });
  const cmd = new GetObjectCommandCtor({
    Bucket: params.bucket,
    Key: params.key,
  });
  const out = (await s3.send(cmd)) as {
    Body?: unknown;
    ContentType?: unknown;
    ContentLength?: unknown;
  };
  const stream = out.Body as Readable;
  const contentType =
    typeof out.ContentType === "string" ? out.ContentType : undefined;
  const contentLength =
    typeof out.ContentLength === "number" ? out.ContentLength : undefined;
  return { stream, contentType, contentLength };
}
