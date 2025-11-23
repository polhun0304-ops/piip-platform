import { Router } from "express";
import { z } from "zod";
import { ReportsRepo } from "../repositories/memory";
import { validateBody, validateParams } from "../middleware/validate";
import { requireScopes } from "../middleware/auth";

const router = Router();

const createBody = z.object({ caseId: z.string().uuid(), title: z.string() });
router.post(
  "/",
  requireScopes(["reports:write"]),
  validateBody(createBody),
  (req, res) => {
    const created = ReportsRepo.create(req.body);
    res.status(201).json(created);
  }
);

const reportIdParams = z.object({ reportId: z.string().uuid() });
router.get(
  "/:reportId",
  requireScopes(["reports:read"]),
  validateParams(reportIdParams),
  (req, res) => {
    const found = ReportsRepo.get(req.params.reportId);
    if (!found)
      return res
        .status(404)
        .json({ code: "NOT_FOUND", message: "Report not found" });
    res.json(found);
  }
);

const patchBody = z.object({
  summary: z.string().optional(),
  body: z.any().optional(),
});
router.patch(
  "/:reportId",
  requireScopes(["reports:write"]),
  validateParams(reportIdParams),
  validateBody(patchBody),
  (req, res) => {
    const updated = ReportsRepo.update(req.params.reportId, req.body);
    if (!updated)
      return res
        .status(404)
        .json({ code: "NOT_FOUND", message: "Report not found" });
    res.json(updated);
  }
);

router.post(
  "/:reportId/submit",
  requireScopes(["reports:write"]),
  validateParams(reportIdParams),
  (req, res) => {
    const updated = ReportsRepo.submit(req.params.reportId);
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
  }
);

export default router;
