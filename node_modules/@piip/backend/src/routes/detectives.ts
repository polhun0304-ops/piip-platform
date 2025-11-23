import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Detective } from "../entities/Detective";
import { CaseAssignment } from "../entities/CaseAssignment";
import {
  verifyJWT,
  requireAdmin,
  requireAdminOrSelf,
  AuthRequest,
} from "../middleware/auth";

const router = Router();

/**
 * GET /api/detectives - 탐정 목록 조회
 * Query Parameters:
 * - status: 활동중|휴식중|비활성
 * - specialty: 전문 분야
 * - region: 지역
 * - city: 도시
 * - minSuccessRate: 최소 성공률
 * - minRating: 최소 평점
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 항목 수 (기본값: 10)
 * - sortBy: 정렬 기준 (averageRating, successRate 등)
 * - order: 정렬 순서 (ASC, DESC)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      status,
      specialty,
      region,
      city,
      minSuccessRate,
      minRating,
      page = 1,
      limit = 10,
      sortBy = "averageRating",
      order = "DESC",
    } = req.query;

    const repo = AppDataSource.getRepository(Detective);
    const queryBuilder = repo.createQueryBuilder("detective");

    if (status) {
      queryBuilder.andWhere("detective.status = :status", { status });
    }
    if (region) {
      queryBuilder.andWhere("detective.region = :region", { region });
    }
    if (city) {
      queryBuilder.andWhere("detective.city = :city", { city });
    }
    if (specialty) {
      queryBuilder.andWhere("detective.specialties LIKE :specialty", {
        specialty: `%"category":"${specialty}"%`,
      });
    }
    if (minSuccessRate) {
      queryBuilder.andWhere("detective.successRate >= :minSuccessRate", {
        minSuccessRate: Number(minSuccessRate),
      });
    }
    if (minRating) {
      queryBuilder.andWhere("detective.averageRating >= :minRating", {
        minRating: Number(minRating),
      });
    }

    const allowedSortBy = ["averageRating", "successRate"]; // 허용된 정렬 기준
    const allowedOrder = ["ASC", "DESC"]; // 허용된 정렬 순서

    const sortByValidated = allowedSortBy.includes(sortBy as string)
      ? sortBy
      : "averageRating";
    const orderValidated = allowedOrder.includes(order as string)
      ? order
      : "DESC";

    const [detectives, total] = await queryBuilder
      .orderBy(`detective.${sortByValidated}`, orderValidated as "ASC" | "DESC")
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .getManyAndCount();

    res.json({
      data: detectives,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (e) {
    console.error("Error fetching detectives:", e);
    let errorMessage = "Internal server error";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/detectives/:id - 탐정 상세 조회
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(Detective);

    const detective = await repo.findOne({ where: { id } });

    if (!detective) {
      return res.status(404).json({ error: "Detective not found" });
    }

    // 최근 배정 내역 조회
    const assignmentRepo = AppDataSource.getRepository(CaseAssignment);
    const recentAssignments = await assignmentRepo.find({
      where: { detectiveId: id },
      relations: ["case"],
      order: { createdAt: "DESC" },
      take: 10,
    });

    res.json({ detective, recentAssignments });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Internal server error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * POST /api/detectives - 새 탐정 등록 (관리자 전용)
 */
router.post(
  "/",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        name,
        phone,
        email,
        licenseNumber,
        experienceYears,
        specialties,
        maxConcurrentCases,
        bio,
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: "name is required" });
      }

      const repo = AppDataSource.getRepository(Detective);
      const detective = repo.create({
        name,
        phone,
        email,
        licenseNumber,
        experienceYears: experienceYears || 0,
        status: "활동중",
        specialties: specialties || [],
        maxConcurrentCases: maxConcurrentCases || 5,
        currentCaseCount: 0,
        averageRating: 0,
        completedCases: 0,
        successRate: 0,
        bio,
        lastActiveAt: new Date(),
      });

      const saved = await repo.save(detective);
      res.status(201).json(saved);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  }
);

/**
 * PUT /api/detectives/:id - 탐정 정보 수정 (관리자 또는 본인)
 */
router.put(
  "/:id",
  verifyJWT,
  requireAdminOrSelf,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const {
        name,
        phone,
        email,
        licenseNumber,
        experienceYears,
        status,
        specialties,
        maxConcurrentCases,
        bio,
        workingHours,
      } = req.body;

      const repo = AppDataSource.getRepository(Detective);
      const detective = await repo.findOne({ where: { id } });

      if (!detective) {
        return res.status(404).json({ error: "Detective not found" });
      }

      if (name !== undefined) detective.name = name;
      if (phone !== undefined) detective.phone = phone;
      if (email !== undefined) detective.email = email;
      if (licenseNumber !== undefined) detective.licenseNumber = licenseNumber;
      if (experienceYears !== undefined)
        detective.experienceYears = experienceYears;
      if (status !== undefined) detective.status = status;
      if (specialties !== undefined) detective.specialties = specialties;
      if (maxConcurrentCases !== undefined)
        detective.maxConcurrentCases = maxConcurrentCases;
      if (bio !== undefined) detective.bio = bio;
      if (workingHours !== undefined) detective.workingHours = workingHours;

      detective.lastActiveAt = new Date();

      const saved = await repo.save(detective);
      res.json(saved);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  }
);

/**
 * POST /api/detectives/:id/specialties - 전문분야 추가/수정
 * Body: { category, level, casesHandled?, successRate? }
 */
router.post("/:id/specialties", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, level, casesHandled, successRate } = req.body;

    if (!category || !level) {
      return res.status(400).json({ error: "category and level are required" });
    }

    const repo = AppDataSource.getRepository(Detective);
    const detective = await repo.findOne({ where: { id } });

    if (!detective) {
      return res.status(404).json({ error: "Detective not found" });
    }

    // 기존 전문분야 찾기
    const existingIndex = detective.specialties.findIndex(
      (s) => s.category === category
    );

    const specialty = {
      category,
      level,
      casesHandled: casesHandled || 0,
      successRate: successRate || 0,
    };

    if (existingIndex >= 0) {
      // 업데이트
      detective.specialties[existingIndex] = specialty;
    } else {
      // 추가
      detective.specialties.push(specialty);
    }

    const saved = await repo.save(detective);
    res.json(saved);
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Internal server error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/detectives/:id/stats - 탐정 통계
 */
router.get("/:id/stats", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const detectiveRepo = AppDataSource.getRepository(Detective);
    const assignmentRepo = AppDataSource.getRepository(CaseAssignment);

    const detective = await detectiveRepo.findOne({ where: { id } });
    if (!detective) {
      return res.status(404).json({ error: "Detective not found" });
    }

    // 배정 통계
    const totalAssignments = await assignmentRepo.count({
      where: { detectiveId: id },
    });
    const acceptedAssignments = await assignmentRepo.count({
      where: { detectiveId: id, status: "accepted" },
    });
    const rejectedAssignments = await assignmentRepo.count({
      where: { detectiveId: id, status: "rejected" },
    });
    const completedAssignments = await assignmentRepo.count({
      where: { detectiveId: id, status: "completed" },
    });

    // 전문분야별 통계
    const specialtyStats = detective.specialties.map((s) => ({
      category: s.category,
      level: s.level,
      casesHandled: s.casesHandled,
      successRate: s.successRate,
    }));

    res.json({
      detective: {
        id: detective.id,
        name: detective.name,
        experienceYears: detective.experienceYears,
        status: detective.status,
      },
      assignments: {
        total: totalAssignments,
        accepted: acceptedAssignments,
        rejected: rejectedAssignments,
        completed: completedAssignments,
        acceptanceRate:
          totalAssignments > 0
            ? Math.round((acceptedAssignments / totalAssignments) * 100)
            : 0,
      },
      performance: {
        averageRating: detective.averageRating,
        successRate: detective.successRate,
        completedCases: detective.completedCases,
      },
      workload: {
        currentCases: detective.currentCaseCount,
        maxCases: detective.maxConcurrentCases,
        utilizationRate: Math.round(
          (detective.currentCaseCount / detective.maxConcurrentCases) * 100
        ),
      },
      specialties: specialtyStats,
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Internal server error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * DELETE /api/detectives/:id - 탐정 비활성화
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(Detective);

    const detective = await repo.findOne({ where: { id } });
    if (!detective) {
      return res.status(404).json({ error: "Detective not found" });
    }

    // 현재 진행 중인 사건이 있으면 삭제 불가
    if (detective.currentCaseCount > 0) {
      return res.status(400).json({
        error: "Cannot deactivate detective with active cases",
        currentCaseCount: detective.currentCaseCount,
      });
    }

    detective.status = "비활성";
    await repo.save(detective);

    res.json({ success: true, message: "Detective deactivated" });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Internal server error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * DELETE /api/detectives/:id - 탐정 삭제 (관리자 전용)
 * 활성 사건이 없을 때만 삭제 가능
 */
router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Detective);

      const detective = await repo.findOne({ where: { id } });
      if (!detective) {
        return res.status(404).json({ error: "Detective not found" });
      }

      if (detective.currentCaseCount > 0) {
        return res.status(400).json({
          error: "Cannot delete detective with active cases",
          currentCaseCount: detective.currentCaseCount,
        });
      }

      await repo.delete(id);
      res.json({ success: true, message: "Detective deleted successfully" });
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  }
);

/**
 * PATCH /api/detectives/:id/activate - 탐정 활성화/비활성화 (관리자 전용)
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

      const repo = AppDataSource.getRepository(Detective);
      const detective = await repo.findOne({ where: { id } });

      if (!detective) {
        return res.status(404).json({ error: "Detective not found" });
      }

      detective.status = isActive ? "활동중" : "비활성";
      await repo.save(detective);

      res.json({
        success: true,
        message: `Detective ${isActive ? "activated" : "deactivated"}`,
        detective,
      });
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  }
);

export default router;
