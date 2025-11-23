export declare function cleanupLocalUploads(retentionDays: number): Promise<{
    removedFiles: number;
    removedRows: number;
}>;
