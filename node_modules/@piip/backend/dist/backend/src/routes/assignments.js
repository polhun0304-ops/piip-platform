"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const CaseAssignment_1 = require("../entities/CaseAssignment");
const caseAssignment_1 = require("../services/caseAssignment");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/assignments - 배정 목록 조회 (관리자: 전체, 탐정: 본인 배정)
 * ?status=pending|assigned|accepted|rejected
 * ?detectiveId=uuid
 * ?caseId=uuid
 */
router.get("/", auth_1.verifyJWT, async (req, res) => {
    try {
        const { status, detectiveId, caseId } = req.query;
        const repo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
        const where = {};
        if (status)
            where.status = status;
        if (caseId)
            where.caseId = caseId;
        // 탐정은 본인 배정만 조회
        if (req.user.role === "detective" && req.user.detectiveId) {
            where.detectiveId = req.user.detectiveId;
        }
        else if (detectiveId) {
            where.detectiveId = detectiveId;
        }
        const assignments = await repo.find({
            where,
            relations: ["case", "detective"],
            order: { createdAt: "DESC" },
        });
        res.json(assignments);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * GET /api/assignments/:id - 배정 상세 조회
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const repo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
        const assignment = await repo.findOne({
            where: { id },
            relations: ["case", "detective"],
        });
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }
        res.json(assignment);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * POST /api/assignments/auto-assign - 사건 자동 배정 (관리자 전용)
 * Body: { caseId, minScore?, maxCandidates? }
 */
router.post("/auto-assign", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { caseId, minScore, maxCandidates } = req.body;
        if (!caseId) {
            return res.status(400).json({ error: "caseId is required" });
        }
        const assignment = await (0, caseAssignment_1.autoAssignDetective)(caseId, {
            minScore,
            maxCandidates,
        });
        if (!assignment) {
            return res.status(200).json({
                success: false,
                message: "No qualified detective found",
            });
        }
        res.status(201).json({ success: true, assignment });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * POST /api/assignments/manual-assign - 사건 수동 배정 (관리자 전용)
 * Body: { caseId, detectiveId, notes? }
 */
router.post("/manual-assign", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { caseId, detectiveId, notes } = req.body;
        if (!caseId || !detectiveId) {
            return res
                .status(400)
                .json({ error: "caseId and detectiveId are required" });
        }
        const assignment = await (0, caseAssignment_1.manualAssignDetective)(caseId, detectiveId, notes);
        res.status(201).json({ success: true, assignment });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * GET /api/assignments/available - 배정 가능한 사건 목록 (추천 탐정 포함) (관리자 전용)
 */
router.get("/available", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const availableCases = await (0, caseAssignment_1.getAvailableCasesForSelection)();
        res.json(availableCases);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * POST /api/assignments/:id/accept - 탐정이 배정 수락 (탐정 전용)
 */
router.post("/:id/accept", auth_1.verifyJWT, auth_1.requireDetective, async (req, res) => {
    try {
        const { id } = req.params;
        await (0, caseAssignment_1.acceptAssignment)(id);
        res.json({ success: true, message: "Assignment accepted" });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * POST /api/assignments/:id/reject - 탐정이 배정 거절 (탐정 전용)
 * Body: { reason }
 */
router.post("/:id/reject", auth_1.verifyJWT, auth_1.requireDetective, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ error: "reason is required" });
        }
        const reassignment = await (0, caseAssignment_1.rejectAssignment)(id, reason);
        res.json({
            success: true,
            message: "Assignment rejected",
            reassignment: reassignment
                ? {
                    id: reassignment.id,
                    detectiveId: reassignment.detectiveId,
                }
                : null,
        });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * DELETE /api/assignments/:id - 배정 해제 (관리자 전용)
 */
router.delete("/:id", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const repo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
        const assignment = await repo.findOne({ where: { id } });
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }
        await repo.delete(id);
        res.json({ success: true, message: "Assignment cancelled successfully" });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * PATCH /api/assignments/:id/priority - 배정 우선순위 설정 (관리자 전용)
 */
router.patch("/:id/priority", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;
        if (priority === undefined) {
            return res.status(400).json({ error: "priority is required" });
        }
        const repo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
        const assignment = await repo.findOne({ where: { id } });
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }
        assignment.priority = priority;
        const updated = await repo.save(assignment);
        res.json(updated);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
exports.default = router;
