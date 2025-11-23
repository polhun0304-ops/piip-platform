"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupLocalUploads = cleanupLocalUploads;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const Evidence_1 = require("../entities/Evidence");
const UPLOADS_ROOT = path_1.default.join(__dirname, "..", "uploads");
async function cleanupLocalUploads(retentionDays) {
    const threshold = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const repo = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
    const list = await repo.find();
    let removedFiles = 0;
    let removedRows = 0;
    for (const ev of list) {
        if (!ev.filePath)
            continue;
        if (!ev.filePath.startsWith("/uploads/"))
            continue;
        const rel = ev.filePath.replace(/^\//, "");
        const full = path_1.default.join(__dirname, "..", rel);
        try {
            const st = await fs_1.default.promises.stat(full);
            if (st.mtime.getTime() < threshold) {
                await fs_1.default.promises.unlink(full).catch(() => { });
                await repo.delete(ev.id);
                removedFiles++;
                removedRows++;
            }
        }
        catch (e) {
            // file missing: remove row to avoid broken records
            await repo.delete(ev.id);
            removedRows++;
        }
    }
    return { removedFiles, removedRows };
}
