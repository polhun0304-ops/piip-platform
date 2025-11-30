import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/database";
import { Evidence } from "../entities/Evidence";

export async function cleanupLocalUploads(
  retentionDays: number
): Promise<{ removedFiles: number; removedRows: number }> {
  const threshold = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const repo = AppDataSource.getRepository(Evidence);
  const list = await repo.find();
  let removedFiles = 0;
  let removedRows = 0;
  for (const ev of list) {
    if (!ev.filePath) continue;
    if (!ev.filePath.startsWith("/uploads/")) continue;
    const rel = ev.filePath.replace(/^\//, "");
    const full = path.join(__dirname, "..", rel);
    try {
      const st = await fs.promises.stat(full);
      if (st.mtime.getTime() < threshold) {
        await fs.promises.unlink(full).catch(() => {});
        await repo.delete(ev.id);
        removedFiles++;
        removedRows++;
      }
    } catch (e) {
      // file missing: remove row to avoid broken records
      await repo.delete(ev.id);
      removedRows++;
    }
  }
  return { removedFiles, removedRows };
}
