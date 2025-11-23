"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const RequestTemplate_1 = require("../entities/RequestTemplate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/templates - 의뢰 템플릿 목록 조회 (공개)
 * ?isActive=true
 */
router.get("/", async (req, res) => {
    try {
        const { isActive } = req.query;
        const repo = database_1.AppDataSource.getRepository(RequestTemplate_1.RequestTemplate);
        const queryBuilder = repo.createQueryBuilder("template");
        if (isActive !== undefined) {
            queryBuilder.where("template.isActive = :isActive", {
                isActive: isActive === "true",
            });
        }
        const templates = await queryBuilder
            .orderBy("template.sortOrder", "ASC")
            .addOrderBy("template.createdAt", "ASC")
            .getMany();
        res.json(templates);
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * GET /api/templates/:id - 템플릿 상세 조회
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const repo = database_1.AppDataSource.getRepository(RequestTemplate_1.RequestTemplate);
        const template = await repo.findOne({ where: { id } });
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }
        res.json(template);
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * POST /api/templates - 템플릿 생성 (관리자 전용)
 */
router.post("/", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, fields, conversationFlow, sortOrder } = req.body;
        if (!name || !description || !fields) {
            return res.status(400).json({
                error: "name, description, and fields are required",
            });
        }
        const repo = database_1.AppDataSource.getRepository(RequestTemplate_1.RequestTemplate);
        const template = repo.create({
            name,
            description,
            fields,
            conversationFlow: conversationFlow || [],
            isActive: true,
            sortOrder: sortOrder || 0,
        });
        const saved = await repo.save(template);
        res.status(201).json(saved);
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * PUT /api/templates/:id - 템플릿 수정 (관리자 전용)
 */
router.put("/:id", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, fields, conversationFlow, isActive, sortOrder, } = req.body;
        const repo = database_1.AppDataSource.getRepository(RequestTemplate_1.RequestTemplate);
        const template = await repo.findOne({ where: { id } });
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }
        repo.merge(template, {
            name,
            description,
            fields,
            conversationFlow,
            isActive,
            sortOrder,
        });
        const updated = await repo.save(template);
        res.json(updated);
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * DELETE /api/templates/:id - 템플릿 삭제 (관리자 전용)
 */
router.delete("/:id", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const repo = database_1.AppDataSource.getRepository(RequestTemplate_1.RequestTemplate);
        const result = await repo.delete(id);
        if (result.affected === 0) {
            return res.status(404).json({ error: "Template not found" });
        }
        res.json({ message: "Template deleted successfully" });
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * PATCH /api/templates/:id/activate - 템플릿 활성화/비활성화 (관리자 전용)
 */
router.patch("/:id/activate", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        if (isActive === undefined) {
            return res.status(400).json({ error: "isActive is required" });
        }
        const repo = database_1.AppDataSource.getRepository(RequestTemplate_1.RequestTemplate);
        const template = await repo.findOne({ where: { id } });
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }
        template.isActive = isActive;
        const updated = await repo.save(template);
        res.json(updated);
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
exports.default = router;
