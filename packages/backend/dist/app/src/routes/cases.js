"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const Case_1 = require("../entities/Case");
const CaseAssignment_1 = require("../entities/CaseAssignment");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/cases - 모든 사건 조회 (관리자: 전체, 탐정: 본인 사건)
router.get("/", auth_1.verifyJWT, async (req, res) => {
    try {
        const caseRepository = database_1.AppDataSource.getRepository(Case_1.Case);
        const queryBuilder = caseRepository.createQueryBuilder("case");
        // 탐정은 본인 배정된 사건만 조회
        if (req.user.role === "detective" && req.user.detectiveId) {
            queryBuilder
                .leftJoin("case.assignments", "assignment")
                .where("assignment.detectiveId = :detectiveId", {
                detectiveId: req.user.detectiveId,
            });
        }
        else if (req.user.role === "client") {
            // 의뢰인은 본인 사건만 조회
            queryBuilder.where("case.clientUserId = :userId", {
                userId: req.user.userId,
            });
        }
        const cases = await queryBuilder
            .orderBy("case.createdAt", "DESC")
            .getMany();
        res.json(cases);
    }
    catch (error) {
        console.error("Error fetching cases:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /api/cases/:id - 특정 사건 조회
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const caseRepository = database_1.AppDataSource.getRepository(Case_1.Case);
        const caseEntity = await caseRepository.findOne({
            where: { id },
            relations: ["evidences"],
        });
        if (!caseEntity) {
            return res.status(404).json({ error: "Case not found" });
        }
        res.json(caseEntity);
    }
    catch (error) {
        console.error("Error fetching case:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /api/cases - 새 사건 생성
router.post("/", auth_1.verifyJWT, async (req, res) => {
    try {
        const { title, description, status, date } = req.body;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
        const caseRepository = database_1.AppDataSource.getRepository(Case_1.Case);
        const newCase = caseRepository.create({
            title,
            description,
            status: status || "대기", // Default to 'Pending' for new requests
            date: date || new Date().toISOString().split('T')[0],
            clientUserId: req.user?.userId, // Link to the creating user
        });
        const savedCase = await caseRepository.save(newCase);
        res.status(201).json(savedCase);
    }
    catch (error) {
        console.error("Error creating case:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// PUT /api/cases/:id - 사건 수정 (관리자 전용)
router.put("/:id", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, date } = req.body;
        const caseRepository = database_1.AppDataSource.getRepository(Case_1.Case);
        const caseEntity = await caseRepository.findOneBy({ id });
        if (!caseEntity) {
            return res.status(404).json({ error: "Case not found" });
        }
        caseRepository.merge(caseEntity, {
            title,
            description,
            status,
            date,
        });
        const updatedCase = await caseRepository.save(caseEntity);
        res.json(updatedCase);
    }
    catch (error) {
        console.error("Error updating case:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// DELETE /api/cases/:id - 사건 삭제 (관리자 전용)
router.delete("/:id", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const caseRepository = database_1.AppDataSource.getRepository(Case_1.Case);
        const result = await caseRepository.delete(id);
        if (result.affected === 0) {
            return res.status(404).json({ error: "Case not found" });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting case:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
/**
 * PATCH /api/cases/:id/status - 사건 상태 변경 (관리자 전용)
 */
router.patch("/:id/status", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: "status is required" });
        }
        const validStatuses = [
            "대기",
            "배정됨",
            "조사중",
            "보고서작성",
            "완료",
            "보류",
            "취소",
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid status",
                validStatuses,
            });
        }
        const caseRepository = database_1.AppDataSource.getRepository(Case_1.Case);
        const caseEntity = await caseRepository.findOne({ where: { id } });
        if (!caseEntity) {
            return res.status(404).json({ error: "Case not found" });
        }
        caseEntity.status = status;
        const updated = await caseRepository.save(caseEntity);
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating case status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
/**
 * PATCH /api/cases/:id/priority - 사건 우선순위 설정 (관리자 전용)
 */
router.patch("/:id/priority", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;
        if (priority === undefined) {
            return res.status(400).json({ error: "priority is required" });
        }
        const caseRepository = database_1.AppDataSource.getRepository(Case_1.Case);
        const caseEntity = await caseRepository.findOne({ where: { id } });
        if (!caseEntity) {
            return res.status(404).json({ error: "Case not found" });
        }
        // Case 엔티티에 priority 필드 추가 필요
        caseEntity.priority = priority;
        const updated = await caseRepository.save(caseEntity);
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating case priority:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
/**
 * POST /api/cases/:id/reassign - 담당 탐정 변경 (관리자 전용)
 */
router.post("/:id/reassign", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { detectiveId, notes } = req.body;
        if (!detectiveId) {
            return res.status(400).json({ error: "detectiveId is required" });
        }
        const assignmentRepo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
        // 기존 배정 취소
        await assignmentRepo.update({ caseId: id, status: "assigned" }, { status: "rejected", rejectionReason: "관리자에 의한 재배정" });
        // 새 배정 생성
        const newAssignment = assignmentRepo.create({
            caseId: id,
            detectiveId,
            status: "assigned",
            assignmentType: "manual",
            notes: notes || "관리자가 직접 배정",
            assignedAt: new Date(),
        });
        const saved = await assignmentRepo.save(newAssignment);
        res.json({
            success: true,
            message: "Case reassigned successfully",
            assignment: saved,
        });
    }
    catch (error) {
        console.error("Error reassigning case:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
