import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { CaseAssignment } from "../entities/CaseAssignment";
import {
  autoAssignDetective,
  manualAssignDetective,
  getAvailableCasesForSelection,
  acceptAssignment,
  rejectAssignment,
} from "../services/caseAssignment";
import {
  verifyJWT,
  requireAdmin,
  requireDetective,
  AuthRequest,
} from "../middleware/auth";

const router = Router();

/**
 * GET /api/assignments - 배정 목록 조회 (관리자: 전체, 탐정: 본인 배정)
 * ?status=pending|assigned|accepted|rejected
 * ?detectiveId=uuid
 * ?caseId=uuid
 */
router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { status, detectiveId, caseId } = req.query;

    const repo = AppDataSource.getRepository(CaseAssignment);
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (caseId) where.caseId = caseId;

    // 탐정은 본인 배정만 조회
    if (req.user!.role === "detective" && req.user!.detectiveId) {
      where.detectiveId = req.user!.detectiveId;
    } else if (detectiveId) {
      where.detectiveId = detectiveId;
    }

    const assignments = await repo.find({
      where,
      relations: ["case", "detective"],
      order: { createdAt: "DESC" },
    });

    res.json(assignments);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * GET /api/assignments/:id - 배정 상세 조회
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(CaseAssignment);

    const assignment = await repo.findOne({
      where: { id },
      relations: ["case", "detective"],
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json(assignment);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

/**
 * POST /api/assignments/auto-assign - 사건 자동 배정 (관리자 전용)
 * Body: { caseId, minScore?, maxCandidates? }
 */
router.post(
  "/auto-assign",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { caseId, minScore, maxCandidates } = req.body;

      if (!caseId) {
        return res.status(400).json({ error: "caseId is required" });
      }

      const assignment = await autoAssignDetective(caseId, {
        minScore,
        maxCandidates,
      });

      if (!assignment) {
        return res.status(200).json({
          success: false,
          message: "No qualified detective found",
        });
      }

      res.status(201).json({ success: true, assignment });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * POST /api/assignments/manual-assign - 사건 수동 배정 (관리자 전용)
 * Body: { caseId, detectiveId, notes? }
 */
router.post(
  "/manual-assign",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { caseId, detectiveId, notes } = req.body;

      if (!caseId || !detectiveId) {
        return res
          .status(400)
          .json({ error: "caseId and detectiveId are required" });
      }

      const assignment = await manualAssignDetective(
        caseId,
        detectiveId,
        notes
      );

      res.status(201).json({ success: true, assignment });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * GET /api/assignments/available - 배정 가능한 사건 목록 (추천 탐정 포함) (관리자 전용)
 */
router.get(
  "/available",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const availableCases = await getAvailableCasesForSelection();
      res.json(availableCases);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * POST /api/assignments/:id/accept - 탐정이 배정 수락 (탐정 전용)
 */
router.post(
  "/:id/accept",
  verifyJWT,
  requireDetective,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await acceptAssignment(id);
      res.json({ success: true, message: "Assignment accepted" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * POST /api/assignments/:id/reject - 탐정이 배정 거절 (탐정 전용)
 * Body: { reason }
 */
router.post(
  "/:id/reject",
  verifyJWT,
  requireDetective,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: "reason is required" });
      }

      const reassignment = await rejectAssignment(id, reason);

      res.json({
        success: true,
        message: "Assignment rejected",
        reassignment: reassignment
          ? {
              id: reassignment.id,
              detectiveId: reassignment.detectiveId,
            }
          : null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * DELETE /api/assignments/:id - 배정 해제 (관리자 전용)
 */
router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(CaseAssignment);

      const assignment = await repo.findOne({ where: { id } });
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      await repo.delete(id);
      res.json({ success: true, message: "Assignment cancelled successfully" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * PATCH /api/assignments/:id/priority - 배정 우선순위 설정 (관리자 전용)
 */
router.patch(
  "/:id/priority",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { priority } = req.body;

      if (priority === undefined) {
        return res.status(400).json({ error: "priority is required" });
      }

      const repo = AppDataSource.getRepository(CaseAssignment);
      const assignment = await repo.findOne({ where: { id } });

      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      assignment.priority = priority;
      const updated = await repo.save(assignment);

      res.json(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

export default router;
