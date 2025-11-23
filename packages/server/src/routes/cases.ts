import { Router } from "express";
import { z } from "zod";
import { CasesRepo, CaseStatus } from "../repositories/memory";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate";
import { requireScopes } from "../middleware/auth";

const router = Router();

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z
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
  search: z.string().max(100).optional(),
});

router.get(
  "/",
  requireScopes(["cases:read"]),
  validateQuery(listQuery),
  (req, res) => {
    const { page, pageSize, status, search } = req.query as any;
    const result = CasesRepo.list({
      page,
      pageSize,
      status: status as CaseStatus | undefined,
      search,
    });
    res.json(result);
  }
);

const createBody = z.object({
  title: z.string().max(200),
  description: z.string().max(5000),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

router.post(
  "/",
  requireScopes(["cases:write"]),
  validateBody(createBody),
  (req, res) => {
    const user = (req as any).user;
    const created = CasesRepo.create({ ...req.body, clientId: user?.id });
    res.status(201).json(created);
  }
);

const caseIdParams = z.object({ caseId: z.string().uuid() });

router.get("/:caseId", validateParams(caseIdParams), (req, res) => {
  const found = CasesRepo.get(req.params.caseId);
  if (!found)
    return res
      .status(404)
      .json({ code: "NOT_FOUND", message: "Case not found" });
  res.json(found);
});

const patchBody = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

router.patch(
  "/:caseId",
  requireScopes(["cases:write"]),
  validateParams(caseIdParams),
  validateBody(patchBody),
  (req, res) => {
    const updated = CasesRepo.update(req.params.caseId, req.body);
    if (!updated)
      return res
        .status(404)
        .json({ code: "NOT_FOUND", message: "Case not found" });
    res.json(updated);
  }
);

const statusBody = z.object({
  to: z.enum([
    "DRAFT",
    "REVIEW",
    "ACTIVE",
    "EVIDENCE_COLLECTION",
    "REPORT_DRAFT",
    "REPORT_REVIEW",
    "CLOSED",
  ]),
  reason: z.string().max(500).optional(),
});

router.post(
  "/:caseId/status",
  requireScopes(["cases:write"]),
  validateParams(caseIdParams),
  validateBody(statusBody),
  (req, res) => {
    const r = CasesRepo.transition(
      req.params.caseId,
      req.body.to as CaseStatus
    );
    if ((r as any).error === "NOT_FOUND")
      return res
        .status(404)
        .json({ code: "NOT_FOUND", message: "Case not found" });
    if ((r as any).error === "INVALID_TRANSITION")
      return res
        .status(409)
        .json({
          code: "INVALID_TRANSITION",
          message: "Transition not allowed",
        });
    res.json((r as any).case);
  }
);

export default router;
