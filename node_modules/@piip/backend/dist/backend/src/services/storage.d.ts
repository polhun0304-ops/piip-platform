import { Readable } from "stream";
type SaveInput = {
    buffer?: Buffer;
    stream?: Readable;
    filename?: string;
    caseId?: string;
    contentType?: string;
};
export declare function saveObject({ buffer, stream, filename, caseId, contentType, }: SaveInput): Promise<{
    urlOrPath: string;
    key: string;
}>;
export declare function isS3Enabled(): boolean;
export declare function parseS3Url(urlOrPath: string): {
    bucket: string;
    key: string;
} | null;
export declare function getS3SignedUrl(params: {
    bucket: string;
    key: string;
    expiresIn?: number;
}): Promise<string>;
export declare function getS3ObjectStream(params: {
    bucket: string;
    key: string;
}): Promise<{
    stream: Readable;
    contentType?: string;
    contentLength?: number;
}>;
export {};
