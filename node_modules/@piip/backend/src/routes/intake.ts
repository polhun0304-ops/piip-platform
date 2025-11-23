import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { RequestTemplate } from "../entities/RequestTemplate";
import {
  startIntakeSession,
  selectTemplate,
  processClientMessage,
  getActiveTemplates,
  getSessionWithHistory,
  cancelSession,
} from "../services/intakeAgent";

const router = Router();

/**
 * GET /api/intake/templates - 활성 템플릿 목록 조회
 */
router.get("/templates", async (req: Request, res: Response) => {
  try {
    const templates = await getActiveTemplates();
    res.json(templates);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * POST /api/intake/templates - 새 템플릿 생성 (관리자용)
 */
router.post("/templates", async (req: Request, res: Response) => {
  try {
    const { name, description, fields, conversationFlow, sortOrder } = req.body;
    if (!name || !fields) {
      return res.status(400).json({ error: "name and fields are required" });
    }

    const repo = AppDataSource.getRepository(RequestTemplate);
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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * PUT /api/intake/templates/:id - 템플릿 수정
 */
router.put("/templates/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, fields, conversationFlow, isActive, sortOrder } =
      req.body;

    const repo = AppDataSource.getRepository(RequestTemplate);
    const template = await repo.findOne({ where: { id } });
    if (!template) return res.status(404).json({ error: "Template not found" });

    if (name !== undefined) template.name = name;
    if (description !== undefined) template.description = description;
    if (fields !== undefined) template.fields = fields;
    if (conversationFlow !== undefined)
      template.conversationFlow = conversationFlow;
    if (isActive !== undefined) template.isActive = isActive;
    if (sortOrder !== undefined) template.sortOrder = sortOrder;

    const saved = await repo.save(template);
    res.json(saved);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * POST /api/intake/session - 새 접수 세션 시작
 */
router.post("/session", async (req: Request, res: Response) => {
  try {
    const session = await startIntakeSession();
    res.status(201).json({ sessionId: session.id, status: session.status });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * POST /api/intake/session/:sessionId/select-template - 템플릿 선택
 */
router.post(
  "/session/:sessionId/select-template",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { templateId } = req.body;
      if (!templateId) {
        return res.status(400).json({ error: "templateId is required" });
      }

      const { session, initialMessage } = await selectTemplate(
        sessionId,
        templateId
      );
      res.json({
        sessionId: session.id,
        status: session.status,
        message: initialMessage,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * POST /api/intake/session/:sessionId/message - 메시지 전송
 */
router.post(
  "/session/:sessionId/message",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "message is required" });
      }

      const { agentMessage, isComplete, extractedData } =
        await processClientMessage(sessionId, message);

      res.json({
        agentMessage,
        isComplete,
        extractedData,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * GET /api/intake/session/:sessionId - 세션 조회 (대화 기록 포함)
 */
router.get("/session/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { session, messages } = await getSessionWithHistory(sessionId);
    res.json({ session, messages });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * DELETE /api/intake/session/:sessionId - 세션 취소
 */
router.delete("/session/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await cancelSession(sessionId);
    res.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

export default router;
