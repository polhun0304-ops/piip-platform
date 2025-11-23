"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const Consultation_1 = require("../entities/Consultation");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const typeorm_1 = require("typeorm");
const validate_1 = require("../middleware/validate");
const rescheduleService_1 = require("../services/rescheduleService");
const slaMonitor_1 = require("../services/slaMonitor");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    type: zod_1.z.enum(["free15", "paid30"]),
    channel: zod_1.z.enum(["voice", "video"]).optional().default("video"),
    timezone: zod_1.z.string().min(1).optional().default("UTC"),
    scheduledAt: zod_1.z.string().datetime().optional().nullable(),
    durationMinutes: zod_1.z.number().int().positive().optional(),
    detectiveId: zod_1.z.string().uuid().optional().nullable(),
    caseId: zod_1.z.string().uuid().optional().nullable(),
    legalAdviceDisclaimerAck: zod_1.z.boolean().optional().default(false),
    recordingConsent: zod_1.z.boolean().optional().default(false),
    privacyPolicyAck: zod_1.z.boolean().optional().default(false),
});
// Create consultation (client/admin)
router.post("/", auth_1.verifyJWT, (0, validate_1.validateBody)(createSchema), async (req, res) => {
    try {
        const { type, channel, timezone, scheduledAt, durationMinutes, detectiveId, caseId, legalAdviceDisclaimerAck, recordingConsent, privacyPolicyAck, } = req.validated.body;
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const repo = database_1.AppDataSource.getRepository(Consultation_1.Consultation);
        const entity = repo.create({
            clientUserId: req.user.userId,
            detectiveId,
            caseId,
            type,
            channel,
            timezone,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            durationMinutes: durationMinutes ?? (type === "paid30" ? 30 : 15),
            status: scheduledAt ? "scheduled" : "proposed",
            legalAdviceDisclaimerAck,
            recordingConsent,
            privacyPolicyAck,
        });
        const saved = await repo.save(entity);
        return res.status(201).json(saved);
    }
    catch (e) {
        console.error("Create consultation error", e);
        return res.status(500).json({ error: "Failed to create consultation" });
    }
});
const listQuerySchema = zod_1.z.object({
    status: zod_1.z
        .enum([
        "proposed",
        "scheduled",
        "started",
        "completed",
        "canceled",
        "no-show",
    ])
        .optional(),
    detectiveId: zod_1.z.string().uuid().optional(),
    caseId: zod_1.z.string().uuid().optional(),
    clientUserId: zod_1.z.string().uuid().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().optional().default(20),
});
// List consultations with filters
router.get("/", auth_1.verifyJWT, (0, validate_1.validateQuery)(listQuerySchema), async (req, res) => {
    try {
        const { status, detectiveId, caseId, clientUserId, startDate, endDate, page, pageSize, } = req.validated.query;
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const repo = database_1.AppDataSource.getRepository(Consultation_1.Consultation);
        const where = {};
        // Role-based filtering
        if (req.user.role === "client") {
            where.clientUserId = req.user.userId;
        }
        if (req.user.role === "detective" &&
            req.user.detectiveId &&
            !detectiveId) {
            where.detectiveId = req.user.detectiveId;
        }
        // Query params
        if (status)
            where.status = status;
        if (detectiveId)
            where.detectiveId = detectiveId;
        if (caseId)
            where.caseId = caseId;
        if (clientUserId && req.user.role === "admin")
            where.clientUserId = clientUserId;
        if (startDate && endDate) {
            where.scheduledAt = (0, typeorm_1.Between)(new Date(startDate), new Date(endDate));
        }
        else if (startDate) {
            where.scheduledAt = (0, typeorm_1.MoreThanOrEqual)(new Date(startDate));
        }
        else if (endDate) {
            where.scheduledAt = (0, typeorm_1.LessThanOrEqual)(new Date(endDate));
        }
        const [items, total] = await repo.findAndCount({
            where,
            order: { createdAt: "DESC" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return res.json({
            items,
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    }
    catch (e) {
        console.error("List consultations error", e);
        return res.status(500).json({ error: "Failed to list consultations" });
    }
});
// Get by id (admin, owner client, assigned detective)
router.get("/:id", auth_1.verifyJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const repo = database_1.AppDataSource.getRepository(Consultation_1.Consultation);
        const c = await repo.findOne({ where: { id } });
        if (!c)
            return res.status(404).json({ error: "Not found" });
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const isOwner = req.user.userId === c.clientUserId;
        const isAdmin = req.user.role === "admin";
        const isDetective = req.user.role === "detective" &&
            !!req.user.detectiveId &&
            req.user.detectiveId === c.detectiveId;
        if (!(isOwner || isAdmin || isDetective)) {
            return res.status(403).json({ error: "Access denied" });
        }
        return res.json(c);
    }
    catch (e) {
        console.error("Get consultation error", e);
        return res.status(500).json({ error: "Failed to fetch consultation" });
    }
});
// 상담 SLA 리포트
router.get("/:id/sla", async (req, res) => {
    const { id } = req.params;
    try {
        const report = await (0, slaMonitor_1.getSLAReport)(id);
        if (!report)
            return res.status(404).send("Consultation not found");
        res.json(report);
    }
    catch (e) {
        res.status(500).send("SLA report failed");
    }
});
const scheduleSchema = zod_1.z.object({
    scheduledAt: zod_1.z.string().datetime(),
    detectiveId: zod_1.z.string().uuid().optional(),
    timezone: zod_1.z.string().min(1).optional(),
});
// Schedule or reschedule
router.patch("/:id/schedule", auth_1.verifyJWT, (0, validate_1.validateBody)(scheduleSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledAt, detectiveId, timezone } = req.validated
            .body;
        const repo = database_1.AppDataSource.getRepository(Consultation_1.Consultation);
        const c = await repo.findOne({ where: { id } });
        if (!c)
            return res.status(404).json({ error: "Not found" });
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const isOwner = req.user.userId === c.clientUserId;
        const isAdmin = req.user.role === "admin";
        const isDetective = req.user.role === "detective" && !!req.user.detectiveId;
        if (!(isOwner || isAdmin || isDetective)) {
            return res.status(403).json({ error: "Access denied" });
        }
        c.scheduledAt = new Date(scheduledAt);
        c.status = "scheduled";
        if (timezone)
            c.timezone = timezone;
        if (detectiveId)
            c.detectiveId = detectiveId;
        const saved = await repo.save(c);
        return res.json(saved);
    }
    catch (e) {
        console.error("Schedule consultation error", e);
        return res.status(500).json({ error: "Failed to schedule consultation" });
    }
});
// 상담 재스케줄링
router.post("/:id/reschedule", async (req, res) => {
    const { id } = req.params;
    const { date, time } = req.body;
    try {
        const result = await (0, rescheduleService_1.rescheduleConsultation)(id, date, time);
        if (!result)
            return res.status(404).send("Consultation not found");
        res.json(result);
    }
    catch (e) {
        res.status(500).send("Reschedule failed");
    }
});
const statusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "proposed",
        "scheduled",
        "started",
        "completed",
        "canceled",
        "no-show",
    ]),
    cancelReason: zod_1.z.string().max(1000).optional(),
    summaryNote: zod_1.z.string().max(4000).optional(),
});
// Update status
router.patch("/:id/status", auth_1.verifyJWT, (0, validate_1.validateBody)(statusSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancelReason, summaryNote } = req.validated.body;
        const repo = database_1.AppDataSource.getRepository(Consultation_1.Consultation);
        const c = await repo.findOne({ where: { id } });
        if (!c)
            return res.status(404).json({ error: "Not found" });
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const isOwner = req.user.userId === c.clientUserId;
        const isAdmin = req.user.role === "admin";
        const isDetective = req.user.role === "detective" && !!req.user.detectiveId;
        // Clients can only cancel their own
        if (req.user.role === "client" && !(isOwner && status === "canceled")) {
            return res
                .status(403)
                .json({ error: "Client can only cancel own consultation" });
        }
        if (!(isOwner || isAdmin || isDetective)) {
            return res.status(403).json({ error: "Access denied" });
        }
        c.status = status;
        if (cancelReason)
            c.cancelReason = cancelReason;
        if (summaryNote)
            c.summaryNote = summaryNote;
        const saved = await repo.save(c);
        return res.json(saved);
    }
    catch (e) {
        console.error("Update status error", e);
        return res.status(500).json({ error: "Failed to update status" });
    }
});
exports.default = router;
