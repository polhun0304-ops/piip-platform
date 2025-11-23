import { Router, Request, Response } from "express";
import { verifyJWT } from "../middleware/auth";
import { AppDataSource } from "../config/database";
import E2EKey from "../entities/E2EKey";
import logger from "../utils/logger";
import { Case } from "../entities/Case";
import { CaseAssignment } from "../entities/CaseAssignment";

// Authenticated request type
interface AuthenticatedRequest extends Request {
  user?: { userId?: string };
}

const router = Router();

// POST /api/e2ee/keys - register or update public key for authenticated user
router.post(
  "/keys",
  verifyJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { publicKey } = req.body as { publicKey?: string };
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!publicKey)
        return res.status(400).json({ error: "publicKey required" });

      const repo = AppDataSource.getRepository(E2EKey);
      const existing = await repo.findOne({ where: { userId } });
      if (existing) {
        existing.publicKey = publicKey;
        await repo.save(existing);
        return res.json({ ok: true, updated: true });
      }

      const created = repo.create({ userId, publicKey });
      await repo.save(created);
      return res.status(201).json({ ok: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("E2EE key register failed: %s", msg);
      return res.status(500).json({ error: "failed" });
    }
  }
);

// GET /api/e2ee/keys/:userId - fetch public key for user (auth required)
router.get("/keys/:userId", verifyJWT, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const repo = AppDataSource.getRepository(E2EKey);
    const found = await repo.findOne({ where: { userId } });
    if (!found) return res.status(404).json({ error: "not found" });
    return res.json({ userId: found.userId, publicKey: found.publicKey });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("E2EE key fetch failed: %s", msg);
    return res.status(500).json({ error: "failed" });
  }
});

// GET /api/e2ee/keys - fetch public keys
// optional query: ?caseId=... -> returns public keys for participants of that case
router.get("/keys", verifyJWT, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.query as { caseId?: string };
    const repo = AppDataSource.getRepository(E2EKey);

    if (caseId) {
      // find participants for the case: clientUserId + assigned detectives
      const caseRepo = AppDataSource.getRepository(Case);
      const assignmentRepo = AppDataSource.getRepository(CaseAssignment);
      const c = await caseRepo.findOne({ where: { id: caseId } });
      if (!c) return res.status(404).json({ error: "case not found" });

      const assignments = await assignmentRepo.find({ where: { caseId } });
      const participantIds = new Set<string>();
      if (c.clientUserId) participantIds.add(c.clientUserId);
      for (const a of assignments)
        if (a.detectiveId) participantIds.add(a.detectiveId);

      const keys = await repo
        .createQueryBuilder("e2e")
        .where("e2e.userId IN (:...ids)", { ids: Array.from(participantIds) })
        .getMany();

      return res.json({
        keys: keys.map((k) => ({ userId: k.userId, publicKey: k.publicKey })),
      });
    }

    // otherwise list all keys (admin use)
    const all = await repo.find();
    return res.json({
      keys: all.map((k) => ({ userId: k.userId, publicKey: k.publicKey })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("E2EE keys fetch failed: %s", msg);
    return res.status(500).json({ error: "failed" });
  }
});

export default router;
