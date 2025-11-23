import { Router, Response } from "express";
import { AppDataSource } from "../config/database";
import { Quote } from "../entities/Quote";
import { Case } from "../entities/Case";
import { PricingTemplate } from "../entities/PricingTemplate";
import { verifyJWT, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/quotes - 견적서 목록 조회
 * ?caseId=xxx
 * ?status=draft|sent|approved|rejected
 */
router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId, status } = req.query;

    const repo = AppDataSource.getRepository(Quote);
    const queryBuilder = repo
      .createQueryBuilder("quote")
      .leftJoinAndSelect("quote.case", "case")
      .leftJoinAndSelect("quote.pricingTemplate", "pricing");

    if (caseId) {
      queryBuilder.andWhere("quote.caseId = :caseId", { caseId });
    }

    if (status) {
      queryBuilder.andWhere("quote.status = :status", { status });
    }

    const quotes = await queryBuilder
      .orderBy("quote.createdAt", "DESC")
      .getMany();

    res.json(quotes);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * GET /api/quotes/:id - 견적서 상세 조회
 */
router.get("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(Quote);

    const quote = await repo.findOne({
      where: { id },
      relations: ["case", "pricingTemplate"],
    });

    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.json(quote);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * POST /api/quotes - 견적서 생성 (관리자 전용)
 */
router.post(
  "/",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        caseId,
        pricingTemplateId,
        items,
        selectedOptions,
        discount,
        estimatedDays,
        notes,
        validUntil,
      } = req.body;

      if (!caseId) {
        return res.status(400).json({ error: "caseId is required" });
      }

      // 사건 확인
      const caseRepo = AppDataSource.getRepository(Case);
      const caseEntity = await caseRepo.findOne({ where: { id: caseId } });
      if (!caseEntity) {
        return res.status(404).json({ error: "Case not found" });
      }

      let basePrice = 0;
      let totalPrice = 0;
      const quoteItems = items || [];

      // 가격표 템플릿 사용
      if (pricingTemplateId) {
        const pricingRepo = AppDataSource.getRepository(PricingTemplate);
        const pricing = await pricingRepo.findOne({
          where: { id: pricingTemplateId },
        });

        if (!pricing) {
          return res.status(404).json({ error: "Pricing template not found" });
        }

        basePrice = pricing.basePrice;
        totalPrice = basePrice;

        // 기본 항목 추가
        quoteItems.push({
          name: pricing.name,
          description: pricing.description || "",
          quantity: 1,
          unitPrice: basePrice,
          totalPrice: basePrice,
        });

        // 선택된 옵션 추가
        if (selectedOptions && pricing.options) {
          for (const optionKey of selectedOptions) {
            const option = pricing.options.find((o) => o.key === optionKey);
            if (option) {
              const optionPrice =
                option.priceType === "percentage"
                  ? Math.round(basePrice * (option.price / 100))
                  : option.price;

              quoteItems.push({
                name: option.label,
                description: option.description || "",
                quantity: 1,
                unitPrice: optionPrice,
                totalPrice: optionPrice,
              });

              totalPrice += optionPrice;
            }
          }
        }
      } else if (items && items.length > 0) {
        // 수동 견적 항목
        totalPrice = items.reduce(
          (sum: number, item: { totalPrice: number }) => sum + item.totalPrice,
          0
        );
        basePrice = totalPrice;
      }

      const finalPrice = totalPrice - (discount || 0);

      const repo = AppDataSource.getRepository(Quote);
      const quote = repo.create({
        caseId,
        pricingTemplateId,
        status: "draft",
        basePrice,
        items: quoteItems,
        selectedOptions: selectedOptions || [],
        totalPrice,
        discount: discount || 0,
        finalPrice,
        estimatedDays,
        notes,
        validUntil: validUntil ? new Date(validUntil) : undefined,
      });
      const saved = await repo.save(quote);

      // ✅ Soft-gating: Quote 생성 후 상담 제안 로직
      try {
        const { proposeConsultationAfterQuote } = await import(
          "../services/consultationGating"
        );
        await proposeConsultationAfterQuote(saved.id);
      } catch (err) {
        console.error("Failed to propose consultation after quote:", err);
        // 오류 발생해도 Quote 생성은 유지
      }

      res.status(201).json(saved);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * PUT /api/quotes/:id - 견적서 수정 (관리자 전용)
 */
router.put(
  "/:id",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { items, discount, estimatedDays, notes, validUntil } = req.body;

      const repo = AppDataSource.getRepository(Quote);
      const quote = await repo.findOne({ where: { id } });

      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      if (quote.status !== "draft") {
        return res.status(400).json({
          error: "Only draft quotes can be modified",
        });
      }

      if (items) {
        quote.items = items;
        quote.totalPrice = items.reduce(
          (sum: number, item: { totalPrice: number }) => sum + item.totalPrice,
          0
        );
      }

      if (discount !== undefined) {
        quote.discount = discount;
      }

      quote.finalPrice = quote.totalPrice - quote.discount;

      repo.merge(quote, {
        estimatedDays,
        notes,
        validUntil: validUntil ? new Date(validUntil) : undefined,
      });
      const updated = await repo.save(quote);
      res.json(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * POST /api/quotes/:id/send - 견적서 발송 (관리자 전용)
 */
router.post(
  "/:id/send",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Quote);

      const quote = await repo.findOne({ where: { id } });
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      if (quote.status !== "draft") {
        return res.status(400).json({
          error: "Only draft quotes can be sent",
        });
      }

      quote.status = "sent";
      const updated = await repo.save(quote);

      res.json(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * POST /api/quotes/:id/approve - 견적서 승인
 */
router.post(
  "/:id/approve",
  verifyJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Quote);

      const quote = await repo.findOne({ where: { id } });
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      if (quote.status !== "sent") {
        return res.status(400).json({
          error: "Only sent quotes can be approved",
        });
      }

      quote.status = "approved";
      quote.approvedAt = new Date();
      quote.approvedBy = req.user!.email;

      const updated = await repo.save(quote);
      res.json(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * POST /api/quotes/:id/reject - 견적서 거절
 */
router.post(
  "/:id/reject",
  verifyJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const repo = AppDataSource.getRepository(Quote);
      const quote = await repo.findOne({ where: { id } });

      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      if (quote.status !== "sent") {
        return res.status(400).json({
          error: "Only sent quotes can be rejected",
        });
      }

      quote.status = "rejected";
      quote.rejectionReason = reason || "";

      const updated = await repo.save(quote);
      res.json(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * DELETE /api/quotes/:id - 견적서 삭제 (관리자 전용)
 */
router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Quote);

      const quote = await repo.findOne({ where: { id } });
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      if (quote.status === "approved") {
        return res.status(400).json({
          error: "Cannot delete approved quotes",
        });
      }

      await repo.delete(id);
      res.json({ message: "Quote deleted successfully" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

export default router;
