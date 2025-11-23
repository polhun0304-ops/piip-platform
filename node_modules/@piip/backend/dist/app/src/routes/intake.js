"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const RequestTemplate_1 = require("../entities/RequestTemplate");
const intakeAgent_1 = require("../services/intakeAgent");
const router = (0, express_1.Router)();
/**
 * GET /api/intake/templates - 활성 템플릿 목록 조회
 */
router.get("/templates", async (req, res) => {
    try {
        const templates = await (0, intakeAgent_1.getActiveTemplates)();
        res.json(templates);
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * POST /api/intake/templates - 새 템플릿 생성 (관리자용)
 */
router.post("/templates", async (req, res) => {
    try {
        const { name, description, fields, conversationFlow, sortOrder } = req.body;
        if (!name || !fields) {
            return res.status(400).json({ error: "name and fields are required" });
        }
        const repo = database_1.AppDataSource.getRepository(RequestTemplate_1.RequestTemplate);
        const template = repo.create({
            name,
            description: description || "",
            fields,
            conversationFlow,
            sortOrder: sortOrder || 0,
            isActive: true,
        });
        const saved = await repo.save(template);
        res.status(201).json(saved);
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * PUT /api/intake/templates/:id - 템플릿 수정
 */
router.put("/templates/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, fields, conversationFlow, isActive, sortOrder } = req.body;
        const repo = database_1.AppDataSource.getRepository(RequestTemplate_1.RequestTemplate);
        const template = await repo.findOne({ where: { id } });
        if (!template)
            return res.status(404).json({ error: "Template not found" });
        if (name !== undefined)
            template.name = name;
        if (description !== undefined)
            template.description = description;
        if (fields !== undefined)
            template.fields = fields;
        if (conversationFlow !== undefined)
            template.conversationFlow = conversationFlow;
        if (isActive !== undefined)
            template.isActive = isActive;
        if (sortOrder !== undefined)
            template.sortOrder = sortOrder;
        const saved = await repo.save(template);
        res.json(saved);
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * POST /api/intake/session - 새 접수 세션 시작
 */
router.post("/session", async (req, res) => {
    try {
        const session = await (0, intakeAgent_1.startIntakeSession)();
        res.status(201).json({ sessionId: session.id, status: session.status });
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * POST /api/intake/session/:sessionId/select-template - 템플릿 선택
 */
router.post("/session/:sessionId/select-template", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { templateId } = req.body;
        if (!templateId) {
            return res.status(400).json({ error: "templateId is required" });
        }
        const { session, initialMessage } = await (0, intakeAgent_1.selectTemplate)(sessionId, templateId);
        res.json({
            sessionId: session.id,
            status: session.status,
            message: initialMessage,
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * POST /api/intake/session/:sessionId/message - 메시지 전송
 */
router.post("/session/:sessionId/message", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "message is required" });
        }
        const { agentMessage, isComplete, extractedData } = await (0, intakeAgent_1.processClientMessage)(sessionId, message);
        res.json({
            agentMessage,
            isComplete,
            extractedData,
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * GET /api/intake/session/:sessionId - 세션 조회 (대화 기록 포함)
 */
router.get("/session/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { session, messages } = await (0, intakeAgent_1.getSessionWithHistory)(sessionId);
        res.json({ session, messages });
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
/**
 * DELETE /api/intake/session/:sessionId - 세션 취소
 */
router.delete("/session/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        await (0, intakeAgent_1.cancelSession)(sessionId);
        res.json({ ok: true });
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
exports.default = router;
