"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const E2EKey_1 = __importDefault(require("../entities/E2EKey"));
const logger_1 = __importDefault(require("../utils/logger"));
const Case_1 = require("../entities/Case");
const CaseAssignment_1 = require("../entities/CaseAssignment");
const router = (0, express_1.Router)();
// POST /api/e2ee/keys - register or update public key for authenticated user
router.post("/keys", auth_1.verifyJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { publicKey } = req.body;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!publicKey)
            return res.status(400).json({ error: "publicKey required" });
        const repo = database_1.AppDataSource.getRepository(E2EKey_1.default);
        const existing = await repo.findOne({ where: { userId } });
        if (existing) {
            existing.publicKey = publicKey;
            await repo.save(existing);
            return res.json({ ok: true, updated: true });
        }
        const created = repo.create({ userId, publicKey });
        await repo.save(created);
        return res.status(201).json({ ok: true });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_1.default.error("E2EE key register failed: %s", msg);
        return res.status(500).json({ error: "failed" });
    }
});
// GET /api/e2ee/keys/:userId - fetch public key for user (auth required)
router.get("/keys/:userId", auth_1.verifyJWT, async (req, res) => {
    try {
        const { userId } = req.params;
        const repo = database_1.AppDataSource.getRepository(E2EKey_1.default);
        const found = await repo.findOne({ where: { userId } });
        if (!found)
            return res.status(404).json({ error: "not found" });
        return res.json({ userId: found.userId, publicKey: found.publicKey });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_1.default.error("E2EE key fetch failed: %s", msg);
        return res.status(500).json({ error: "failed" });
    }
});
// GET /api/e2ee/keys - fetch public keys
// optional query: ?caseId=... -> returns public keys for participants of that case
router.get("/keys", auth_1.verifyJWT, async (req, res) => {
    try {
        const { caseId } = req.query;
        const repo = database_1.AppDataSource.getRepository(E2EKey_1.default);
        if (caseId) {
            // find participants for the case: clientUserId + assigned detectives
            const caseRepo = database_1.AppDataSource.getRepository(Case_1.Case);
            const assignmentRepo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
            const c = await caseRepo.findOne({ where: { id: caseId } });
            if (!c)
                return res.status(404).json({ error: "case not found" });
            const assignments = await assignmentRepo.find({ where: { caseId } });
            const participantIds = new Set();
            if (c.clientUserId)
                participantIds.add(c.clientUserId);
            for (const a of assignments)
                if (a.detectiveId)
                    participantIds.add(a.detectiveId);
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
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_1.default.error("E2EE keys fetch failed: %s", msg);
        return res.status(500).json({ error: "failed" });
    }
});
exports.default = router;
