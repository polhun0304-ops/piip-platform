"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const memory_1 = require("../repositories/memory");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const listQuery = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z
        .enum([
        "DRAFT",
        "REVIEW",
        "ACTIVE",
        "EVIDENCE_COLLECTION",
        "REPORT_DRAFT",
        "REPORT_REVIEW",
        "CLOSED",
    ])
        .optional(),
    search: zod_1.z.string().max(100).optional(),
});
router.get("/", (0, auth_1.requireScopes)(["cases:read"]), (0, validate_1.validateQuery)(listQuery), (req, res) => {
    const { page, pageSize, status, search } = req.query;
    const result = memory_1.CasesRepo.list({
        page,
        pageSize,
        status: status,
        search,
    });
    res.json(result);
});
const createBody = zod_1.z.object({
    title: zod_1.z.string().max(200),
    description: zod_1.z.string().max(5000),
    priority: zod_1.z.enum(["low", "normal", "high", "urgent"]).optional(),
});
router.post("/", (0, auth_1.requireScopes)(["cases:write"]), (0, validate_1.validateBody)(createBody), (req, res) => {
    const user = req.user;
    const created = memory_1.CasesRepo.create({ ...req.body, clientId: user?.id });
    res.status(201).json(created);
});
const caseIdParams = zod_1.z.object({ caseId: zod_1.z.string().uuid() });
router.get("/:caseId", (0, validate_1.validateParams)(caseIdParams), (req, res) => {
    const found = memory_1.CasesRepo.get(req.params.caseId);
    if (!found)
        return res
            .status(404)
            .json({ code: "NOT_FOUND", message: "Case not found" });
    res.json(found);
});
const patchBody = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(["low", "normal", "high", "urgent"]).optional(),
});
router.patch("/:caseId", (0, auth_1.requireScopes)(["cases:write"]), (0, validate_1.validateParams)(caseIdParams), (0, validate_1.validateBody)(patchBody), (req, res) => {
    const updated = memory_1.CasesRepo.update(req.params.caseId, req.body);
    if (!updated)
        return res
            .status(404)
            .json({ code: "NOT_FOUND", message: "Case not found" });
    res.json(updated);
});
const statusBody = zod_1.z.object({
    to: zod_1.z.enum([
        "DRAFT",
        "REVIEW",
        "ACTIVE",
        "EVIDENCE_COLLECTION",
        "REPORT_DRAFT",
        "REPORT_REVIEW",
        "CLOSED",
    ]),
    reason: zod_1.z.string().max(500).optional(),
});
router.post("/:caseId/status", (0, auth_1.requireScopes)(["cases:write"]), (0, validate_1.validateParams)(caseIdParams), (0, validate_1.validateBody)(statusBody), (req, res) => {
    const r = memory_1.CasesRepo.transition(req.params.caseId, req.body.to);
    if (r.error === "NOT_FOUND")
        return res
            .status(404)
            .json({ code: "NOT_FOUND", message: "Case not found" });
    if (r.error === "INVALID_TRANSITION")
        return res
            .status(409)
            .json({
            code: "INVALID_TRANSITION",
            message: "Transition not allowed",
        });
    res.json(r.case);
});
exports.default = router;
