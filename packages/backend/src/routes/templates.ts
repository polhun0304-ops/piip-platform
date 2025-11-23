import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { RequestTemplate } from "../entities/RequestTemplate";
import { verifyJWT, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/templates - 의뢰 템플릿 목록 조회 (공개)
 * ?isActive=true
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    const repo = AppDataSource.getRepository(RequestTemplate);
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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * GET /api/templates/:id - 템플릿 상세 조회
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(RequestTemplate);

    const template = await repo.findOne({ where: { id } });
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(template);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * POST /api/templates - 템플릿 생성 (관리자 전용)
 */
router.post(
  "/",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, fields, conversationFlow, sortOrder } =
        req.body;

      if (!name || !description || !fields) {
        return res.status(400).json({
          error: "name, description, and fields are required",
        });
      }

      const repo = AppDataSource.getRepository(RequestTemplate);
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * PUT /api/templates/:id - 템플릿 수정 (관리자 전용)
 */
router.put(
  "/:id",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        fields,
        conversationFlow,
        isActive,
        sortOrder,
      } = req.body;

      const repo = AppDataSource.getRepository(RequestTemplate);
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * DELETE /api/templates/:id - 템플릿 삭제 (관리자 전용)
 */
router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(RequestTemplate);

      const result = await repo.delete(id);
      if (result.affected === 0) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.json({ message: "Template deleted successfully" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * PATCH /api/templates/:id/activate - 템플릿 활성화/비활성화 (관리자 전용)
 */
router.patch(
  "/:id/activate",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({ error: "isActive is required" });
      }

      const repo = AppDataSource.getRepository(RequestTemplate);
      const template = await repo.findOne({ where: { id } });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      template.isActive = isActive;
      const updated = await repo.save(template);

      res.json(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

export default router;
