"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const memory_1 = require("../repositories/memory");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const createBody = zod_1.z.object({ caseId: zod_1.z.string().uuid(), title: zod_1.z.string() });
router.post("/", (0, auth_1.requireScopes)(["reports:write"]), (0, validate_1.validateBody)(createBody), (req, res) => {
    const created = memory_1.ReportsRepo.create(req.body);
    res.status(201).json(created);
});
const reportIdParams = zod_1.z.object({ reportId: zod_1.z.string().uuid() });
router.get("/:reportId", (0, auth_1.requireScopes)(["reports:read"]), (0, validate_1.validateParams)(reportIdParams), (req, res) => {
    const found = memory_1.ReportsRepo.get(req.params.reportId);
    if (!found)
        return res
            .status(404)
            .json({ code: "NOT_FOUND", message: "Report not found" });
    res.json(found);
});
const patchBody = zod_1.z.object({
    summary: zod_1.z.string().optional(),
    body: zod_1.z.any().optional(),
});
router.patch("/:reportId", (0, auth_1.requireScopes)(["reports:write"]), (0, validate_1.validateParams)(reportIdParams), (0, validate_1.validateBody)(patchBody), (req, res) => {
    const updated = memory_1.ReportsRepo.update(req.params.reportId, req.body);
    if (!updated)
        return res
            .status(404)
            .json({ code: "NOT_FOUND", message: "Report not found" });
    res.json(updated);
});
router.post("/:reportId/submit", (0, auth_1.requireScopes)(["reports:write"]), (0, validate_1.validateParams)(reportIdParams), (req, res) => {
    const updated = memory_1.ReportsRepo.submit(req.params.reportId);
    if (!updated)
        return res
            .status(404)
            .json({ code: "NOT_FOUND", message: "Report not found" });
    // TODO: webhook 트리거 시뮬레이션 (log)
    console.log("[webhook] report.reviewed (in_review pending review):", {
        id: updated.id,
        caseId: updated.caseId,
    });
    res.json(updated);
});
exports.default = router;
