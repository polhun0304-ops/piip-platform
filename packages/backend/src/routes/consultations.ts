import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Consultation } from "../entities/Consultation";
import { verifyJWT, AuthRequest } from "../middleware/auth";
import { z } from "zod";
import {
  DeepPartial,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from "typeorm";
import { validateBody, validateQuery } from "../middleware/validate";
import { rescheduleConsultation } from "../services/rescheduleService";
import { getSLAReport } from "../services/slaMonitor";

const router = Router();

const createSchema = z.object({
  type: z.enum(["free15", "paid30"]),
  channel: z.enum(["voice", "video"]).optional().default("video"),
  timezone: z.string().min(1).optional().default("UTC"),
  scheduledAt: z.string().datetime().optional().nullable(),
  durationMinutes: z.number().int().positive().optional(),
  detectiveId: z.string().uuid().optional().nullable(),
  caseId: z.string().uuid().optional().nullable(),
  legalAdviceDisclaimerAck: z.boolean().optional().default(false),
  recordingConsent: z.boolean().optional().default(false),
  privacyPolicyAck: z.boolean().optional().default(false),
});

// Create consultation (client/admin)
router.post(
  "/",
  verifyJWT,
  validateBody(createSchema),
  async (req: AuthRequest, res) => {
    try {
      const validatedBody = (
        req as unknown as { validated?: { body?: Record<string, unknown> } }
      ).validated?.body as Record<string, unknown> | undefined;
      const {
        type,
        channel,
        timezone,
        scheduledAt,
        durationMinutes,
        detectiveId,
        caseId,
        legalAdviceDisclaimerAck,
        recordingConsent,
        privacyPolicyAck,
      } = (validatedBody ?? req.body) as Record<string, unknown>;
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const repo = AppDataSource.getRepository(Consultation);
      const entity = repo.create({
        clientUserId: req.user.userId,
        detectiveId,
        caseId,
        type,
        channel,
        timezone,
        scheduledAt: scheduledAt ? new Date(String(scheduledAt)) : undefined,
        durationMinutes: durationMinutes ?? (type === "paid30" ? 30 : 15),
        status: scheduledAt ? "scheduled" : "proposed",
        legalAdviceDisclaimerAck,
        recordingConsent,
        privacyPolicyAck,
      } as DeepPartial<Consultation>);
      const saved = await repo.save(entity);
      return res.status(201).json(saved);
    } catch (e: unknown) {
      console.error("Create consultation error", e);
      const msg = e instanceof Error ? e.message : String(e);
      return res
        .status(500)
        .json({ error: msg || "Failed to create consultation" });
    }
  }
);

const listQuerySchema = z.object({
  status: z
    .enum([
      "proposed",
      "scheduled",
      "started",
      "completed",
      "canceled",
      "no-show",
    ])
    .optional(),
  detectiveId: z.string().uuid().optional(),
  caseId: z.string().uuid().optional(),
  clientUserId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().optional().default(20),
});

// List consultations with filters
router.get(
  "/",
  verifyJWT,
  validateQuery(listQuerySchema),
  async (req: AuthRequest, res) => {
    try {
      const validatedQuery = (
        req as unknown as { validated?: { query?: Record<string, unknown> } }
      ).validated?.query as Record<string, unknown> | undefined;
      const {
        status,
        detectiveId,
        caseId,
        clientUserId,
        startDate,
        endDate,
        page,
        pageSize,
      } = (validatedQuery ?? req.query) as Record<string, unknown>;
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const repo = AppDataSource.getRepository(Consultation);
      const where: Record<string, unknown> = {};

      // Role-based filtering
      if (req.user.role === "client") {
        where.clientUserId = req.user.userId;
      }
      if (
        req.user.role === "detective" &&
        req.user.detectiveId &&
        !detectiveId
      ) {
        where.detectiveId = req.user.detectiveId;
      }

      // Query params
      if (status) where.status = status;
      if (detectiveId) where.detectiveId = detectiveId;
      if (caseId) where.caseId = caseId;
      if (clientUserId && req.user.role === "admin")
        where.clientUserId = clientUserId;
      if (startDate && endDate) {
        where.scheduledAt = Between(
          new Date(String(startDate)),
          new Date(String(endDate))
        );
      } else if (startDate) {
        where.scheduledAt = MoreThanOrEqual(new Date(String(startDate)));
      } else if (endDate) {
        where.scheduledAt = LessThanOrEqual(new Date(String(endDate)));
      }

      const [items, total] = await repo.findAndCount({
        where,
        order: { createdAt: "DESC" },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
      });

      return res.json({
        items,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      });
    } catch (e: unknown) {
      console.error("List consultations error", e);
      const msg = e instanceof Error ? e.message : String(e);
      return res
        .status(500)
        .json({ error: msg || "Failed to list consultations" });
    }
  }
);

// Get by id (admin, owner client, assigned detective)
router.get("/:id", verifyJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(Consultation);
    const c = await repo.findOne({ where: { id } });
    if (!c) return res.status(404).json({ error: "Not found" });
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const isOwner = req.user.userId === c.clientUserId;
    const isAdmin = req.user.role === "admin";
    const isDetective =
      req.user.role === "detective" &&
      !!req.user.detectiveId &&
      req.user.detectiveId === c.detectiveId;
    if (!(isOwner || isAdmin || isDetective)) {
      return res.status(403).json({ error: "Access denied" });
    }
    return res.json(c);
  } catch (e: unknown) {
    console.error("Get consultation error", e);
    const msg = e instanceof Error ? e.message : String(e);
    return res
      .status(500)
      .json({ error: msg || "Failed to fetch consultation" });
  }
});

// 상담 SLA 리포트
router.get("/:id/sla", async (req, res) => {
  const { id } = req.params;
  try {
    const report = await getSLAReport(id);
    if (!report) return res.status(404).send("Consultation not found");
    res.json(report);
  } catch (e) {
    res.status(500).send("SLA report failed");
  }
});

const scheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
  detectiveId: z.string().uuid().optional(),
  timezone: z.string().min(1).optional(),
});

// Schedule or reschedule
router.patch(
  "/:id/schedule",
  verifyJWT,
  validateBody(scheduleSchema),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedBody = (
        req as unknown as { validated?: { body?: Record<string, unknown> } }
      ).validated?.body as Record<string, unknown> | undefined;
      const { scheduledAt, detectiveId, timezone } = (validatedBody ??
        req.body) as Record<string, unknown>;
      const repo = AppDataSource.getRepository(Consultation);
      const c = await repo.findOne({ where: { id } });
      if (!c) return res.status(404).json({ error: "Not found" });
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const isOwner = req.user.userId === c.clientUserId;
      const isAdmin = req.user.role === "admin";
      const isDetective =
        req.user.role === "detective" && !!req.user.detectiveId;
      if (!(isOwner || isAdmin || isDetective)) {
        return res.status(403).json({ error: "Access denied" });
      }

      c.scheduledAt = new Date(String(scheduledAt));
      c.status = "scheduled";
      if (typeof timezone === "string") c.timezone = timezone;
      if (typeof detectiveId === "string") c.detectiveId = detectiveId;
      const saved = await repo.save(c);
      return res.json(saved);
    } catch (e: unknown) {
      console.error("Schedule consultation error", e);
      const msg = e instanceof Error ? e.message : String(e);
      return res
        .status(500)
        .json({ error: msg || "Failed to schedule consultation" });
    }
  }
);

// 상담 재스케줄링
router.post("/:id/reschedule", async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;
  try {
    const result = await rescheduleConsultation(id, date, time);
    if (!result) return res.status(404).send("Consultation not found");
    res.json(result);
  } catch (e) {
    res.status(500).send("Reschedule failed");
  }
});

const statusSchema = z.object({
  status: z.enum([
    "proposed",
    "scheduled",
    "started",
    "completed",
    "canceled",
    "no-show",
  ]),
  cancelReason: z.string().max(1000).optional(),
  summaryNote: z.string().max(4000).optional(),
});

// Update status
router.patch(
  "/:id/status",
  verifyJWT,
  validateBody(statusSchema),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedBody = (
        req as unknown as { validated?: { body?: Record<string, unknown> } }
      ).validated?.body as Record<string, unknown> | undefined;
      const { status, cancelReason, summaryNote } = (validatedBody ??
        req.body) as Record<string, unknown>;
      const repo = AppDataSource.getRepository(Consultation);
      const c = await repo.findOne({ where: { id } });
      if (!c) return res.status(404).json({ error: "Not found" });
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const isOwner = req.user.userId === c.clientUserId;
      const isAdmin = req.user.role === "admin";
      const isDetective =
        req.user.role === "detective" && !!req.user.detectiveId;

      // Clients can only cancel their own
      if (req.user.role === "client" && !(isOwner && status === "canceled")) {
        return res
          .status(403)
          .json({ error: "Client can only cancel own consultation" });
      }
      if (!(isOwner || isAdmin || isDetective)) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (status) c.status = status as unknown as Consultation["status"];
      if (cancelReason) c.cancelReason = String(cancelReason);
      if (summaryNote) c.summaryNote = String(summaryNote);
      const saved = await repo.save(c);
      return res.json(saved);
    } catch (e: unknown) {
      console.error("Update status error", e);
      const msg = e instanceof Error ? e.message : String(e);
      return res.status(500).json({ error: msg || "Failed to update status" });
    }
  }
);

export default router;
