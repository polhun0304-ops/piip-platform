import { Router, Response } from "express";
import { AppDataSource } from "../config/database";
import { Case } from "../entities/Case";
import { CaseAssignment } from "../entities/CaseAssignment";
import {
  verifyJWT,
  requireAdmin,
  requireDetective,
  AuthRequest,
} from "../middleware/auth";

const router = Router();

// GET /api/cases - 모든 사건 조회 (관리자: 전체, 탐정: 본인 사건)
router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const caseRepository = AppDataSource.getRepository(Case);
    const queryBuilder = caseRepository.createQueryBuilder("case");

    // 탐정은 본인 배정된 사건만 조회
    if (req.user!.role === "detective" && req.user!.detectiveId) {
      queryBuilder
        .leftJoinAndSelect("case.assignments", "assignment")
        .where("assignment.detectiveId = :detectiveId", {
          detectiveId: req.user!.detectiveId,
        });
    } else if (req.user!.role === "client") {
      // 의뢰인은 본인 사건만 조회
      queryBuilder.where("case.clientUserId = :userId", {
        userId: req.user!.userId,
      });
    }

    const cases = await queryBuilder
      .orderBy("case.createdAt", "DESC")
      .getMany();
    res.json(cases);
  } catch (e: unknown) {
    console.error("Error fetching cases:", e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// GET /api/cases/:id - 특정 사건 조회
router.get("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const caseRepository = AppDataSource.getRepository(Case);
    const caseEntity = await caseRepository.findOne({
      where: { id },
      relations: ["evidences", "assignments"],
    });

    if (!caseEntity) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Permission Check
    if (req.user?.role === "client") {
      if (caseEntity.clientUserId !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    } else if (req.user?.role === "detective") {
      const isAssigned = caseEntity.assignments?.some(
        (a) => a.detectiveId === req.user?.detectiveId
      );
      if (!isAssigned) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    res.json(caseEntity);
  } catch (e: unknown) {
    console.error("Error fetching case:", e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// POST /api/cases - 새 사건 생성
router.post("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, date } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const caseRepository = AppDataSource.getRepository(Case);
    const newCase = caseRepository.create({
      title,
      description,
      status: status || "대기", // Default to 'Pending' for new requests
      date: date || new Date().toISOString().split("T")[0],
      clientUserId: req.user?.userId, // Link to the creating user
    });

    const savedCase = await caseRepository.save(newCase);
    res.status(201).json(savedCase);
  } catch (e: unknown) {
    console.error("Error creating case:", e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// PUT /api/cases/:id - 사건 수정 (관리자 전용)
router.put(
  "/:id",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, status, date } = req.body;

      const caseRepository = AppDataSource.getRepository(Case);
      const caseEntity = await caseRepository.findOneBy({ id });

      if (!caseEntity) {
        return res.status(404).json({ error: "Case not found" });
      }

      caseRepository.merge(caseEntity, {
        title,
        description,
        status,
        date,
      });

      const updatedCase = await caseRepository.save(caseEntity);
      res.json(updatedCase);
    } catch (e: unknown) {
      console.error("Error updating case:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

// DELETE /api/cases/:id - 사건 삭제 (관리자 전용)
router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const caseRepository = AppDataSource.getRepository(Case);
      const result = await caseRepository.delete(id);

      if (result.affected === 0) {
        return res.status(404).json({ error: "Case not found" });
      }

      res.status(204).send();
    } catch (e: unknown) {
      console.error("Error deleting case:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * PATCH /api/cases/:id/status - 사건 상태 변경 (관리자 전용)
 */
router.patch(
  "/:id/status",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "status is required" });
      }

      const validStatuses = [
        "대기",
        "배정됨",
        "조사중",
        "보고서작성",
        "완료",
        "보류",
        "취소",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          validStatuses,
        });
      }

      const caseRepository = AppDataSource.getRepository(Case);
      const caseEntity = await caseRepository.findOne({ where: { id } });

      if (!caseEntity) {
        return res.status(404).json({ error: "Case not found" });
      }

      caseEntity.status = status;
      const updated = await caseRepository.save(caseEntity);

      res.json(updated);
    } catch (e: unknown) {
      console.error("Error updating case status:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * PATCH /api/cases/:id/priority - 사건 우선순위 설정 (관리자 전용)
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

      const caseRepository = AppDataSource.getRepository(Case);
      const caseEntity = await caseRepository.findOne({ where: { id } });

      if (!caseEntity) {
        return res.status(404).json({ error: "Case not found" });
      }

      // Case 엔티티에 priority 필드 추가 필요
      (caseEntity as unknown as Record<string, unknown>).priority = priority;
      const updated = await caseRepository.save(caseEntity);

      res.json(updated);
    } catch (e: unknown) {
      console.error("Error updating case priority:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

/**
 * POST /api/cases/:id/reassign - 담당 탐정 변경 (관리자 전용)
 */
router.post(
  "/:id/reassign",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { detectiveId, notes } = req.body;

      if (!detectiveId) {
        return res.status(400).json({ error: "detectiveId is required" });
      }

      const assignmentRepo = AppDataSource.getRepository(CaseAssignment);

      // 기존 배정 취소
      await assignmentRepo.update(
        { caseId: id, status: "assigned" },
        { status: "rejected", rejectionReason: "관리자에 의한 재배정" }
      );

      // 새 배정 생성
      const newAssignment = assignmentRepo.create({
        caseId: id,
        detectiveId,
        status: "assigned",
        assignmentType: "manual",
        notes: notes || "관리자가 직접 배정",
        assignedAt: new Date(),
      });

      const saved = await assignmentRepo.save(newAssignment);

      res.json({
        success: true,
        message: "Case reassigned successfully",
        assignment: saved,
      });
    } catch (e: unknown) {
      console.error("Error reassigning case:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

// POST /api/cases/:id/assign - 사건 배정 (관리자 전용)
router.post(
  "/:id/assign",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { detectiveId } = req.body;

      if (!detectiveId) {
        return res.status(400).json({ error: "Detective ID is required" });
      }

      const caseRepo = AppDataSource.getRepository(Case);
      const assignmentRepo = AppDataSource.getRepository(CaseAssignment);

      const targetCase = await caseRepo.findOne({ where: { id } });
      if (!targetCase) {
        return res.status(404).json({ error: "Case not found" });
      }

      // Check if already assigned to this detective
      const existing = await assignmentRepo.findOne({
        where: { caseId: id, detectiveId, status: "assigned" },
      });

      if (existing) {
        return res
          .status(400)
          .json({ error: "Already assigned to this detective" });
      }

      const assignment = assignmentRepo.create({
        caseId: id,
        detectiveId,
        status: "assigned",
        assignmentType: "manual",
      });

      await assignmentRepo.save(assignment);

      // Update case status if needed
      targetCase.status = "조사 중"; // Or keep as '대기' until accepted? Let's say '조사 중' implies active process starts or '배정됨'
      // For now, let's keep case status as is or update to 'Assigned' if we had that status.
      // The Case entity has '조사 중' | '종료' | '대기'.
      // Let's keep it '대기' until detective accepts? Or '조사 중'?
      // Usually '조사 중' means active.

      res.status(201).json(assignment);
    } catch (e: unknown) {
      console.error("Error assigning case:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

// POST /api/cases/:id/accept - 사건 수임 (탐정 전용)
router.post(
  "/:id/accept",
  verifyJWT,
  requireDetective,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const detectiveId = req.user?.detectiveId;

      const assignmentRepo = AppDataSource.getRepository(CaseAssignment);
      const caseRepo = AppDataSource.getRepository(Case);

      const assignment = await assignmentRepo.findOne({
        where: { caseId: id, detectiveId, status: "assigned" },
      });

      if (!assignment) {
        return res.status(404).json({ error: "No pending assignment found" });
      }

      assignment.status = "accepted";
      await assignmentRepo.save(assignment);

      // Update case status to Active
      await caseRepo.update(id, { status: "조사 중" });

      res.json({ message: "Case accepted", assignment });
    } catch (e: unknown) {
      console.error("Error accepting case:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

// POST /api/cases/:id/reject - 사건 거절 (탐정 전용)
router.post(
  "/:id/reject",
  verifyJWT,
  requireDetective,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const detectiveId = req.user?.detectiveId;

      const assignmentRepo = AppDataSource.getRepository(CaseAssignment);

      const assignment = await assignmentRepo.findOne({
        where: { caseId: id, detectiveId, status: "assigned" },
      });

      if (!assignment) {
        return res.status(404).json({ error: "No pending assignment found" });
      }

      assignment.status = "rejected";
      await assignmentRepo.save(assignment);

      res.json({ message: "Case rejected", assignment });
    } catch (e: unknown) {
      console.error("Error rejecting case:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

export default router;
