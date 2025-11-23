"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const Case_1 = require("../entities/Case");
const Detective_1 = require("../entities/Detective");
const CaseAssignment_1 = require("../entities/CaseAssignment");
const Quote_1 = require("../entities/Quote");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboard/admin - 관리자 대시보드 통계
 */
router.get("/admin", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const caseRepo = database_1.AppDataSource.getRepository(Case_1.Case);
        const detectiveRepo = database_1.AppDataSource.getRepository(Detective_1.Detective);
        const assignmentRepo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
        const quoteRepo = database_1.AppDataSource.getRepository(Quote_1.Quote);
        // 사건 통계
        const totalCases = await caseRepo.count();
        const casesByStatus = await caseRepo
            .createQueryBuilder("case")
            .select("case.status", "status")
            .addSelect("COUNT(*)", "count")
            .groupBy("case.status")
            .getRawMany();
        // 탐정 통계
        const totalDetectives = await detectiveRepo.count();
        const activeDetectives = await detectiveRepo.count({
            where: { status: "활동중" },
        });
        const detectiveUtilization = await detectiveRepo
            .createQueryBuilder("detective")
            .select("AVG(detective.currentCaseCount * 100.0 / detective.maxConcurrentCases)", "avgUtilization")
            .where("detective.status = :status", { status: "활동중" })
            .getRawOne();
        // 배정 통계
        const totalAssignments = await assignmentRepo.count();
        const assignmentsByStatus = await assignmentRepo
            .createQueryBuilder("assignment")
            .select("assignment.status", "status")
            .addSelect("COUNT(*)", "count")
            .groupBy("assignment.status")
            .getRawMany();
        // 평균 배정 시간
        const avgAssignmentTime = await assignmentRepo
            .createQueryBuilder("assignment")
            .select("AVG(JULIANDAY(assignment.assignedAt) - JULIANDAY(assignment.createdAt))", "avgDays")
            .where("assignment.assignedAt IS NOT NULL")
            .getRawOne();
        // 견적서 통계
        const totalQuotes = await quoteRepo.count();
        const approvedQuotes = await quoteRepo.count({
            where: { status: "approved" },
        });
        const totalRevenue = await quoteRepo
            .createQueryBuilder("quote")
            .select("SUM(quote.finalPrice)", "total")
            .where("quote.status = :status", { status: "approved" })
            .getRawOne();
        // 탐정별 성과 Top 5
        const topDetectives = await detectiveRepo.find({
            where: { status: "활동중" },
            order: {
                averageRating: "DESC",
                successRate: "DESC",
            },
            take: 5,
        });
        res.json({
            cases: {
                total: totalCases,
                byStatus: casesByStatus,
            },
            detectives: {
                total: totalDetectives,
                active: activeDetectives,
                avgUtilization: parseFloat(detectiveUtilization?.avgUtilization || "0"),
                top: topDetectives.map((d) => ({
                    id: d.id,
                    name: d.name,
                    rating: d.averageRating,
                    successRate: d.successRate,
                    completedCases: d.completedCases,
                })),
            },
            assignments: {
                total: totalAssignments,
                byStatus: assignmentsByStatus,
                avgAssignmentDays: parseFloat(avgAssignmentTime?.avgDays || "0"),
            },
            revenue: {
                totalQuotes,
                approvedQuotes,
                totalRevenue: parseInt(totalRevenue?.total || "0"),
            },
        });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * GET /api/dashboard/detective/:detectiveId - 탐정 개인 대시보드
 */
router.get("/detective/:detectiveId", auth_1.verifyJWT, auth_1.requireDetective, async (req, res) => {
    try {
        const { detectiveId } = req.params;
        // 본인 또는 관리자만 조회 가능
        if (req.user.role !== "admin" && req.user.detectiveId !== detectiveId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const detectiveRepo = database_1.AppDataSource.getRepository(Detective_1.Detective);
        const assignmentRepo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
        const detective = await detectiveRepo.findOne({
            where: { id: detectiveId },
        });
        if (!detective) {
            return res.status(404).json({ error: "Detective not found" });
        }
        // 배정 통계
        const totalAssignments = await assignmentRepo.count({
            where: { detectiveId },
        });
        const acceptedAssignments = await assignmentRepo.count({
            where: { detectiveId, status: "accepted" },
        });
        const rejectedAssignments = await assignmentRepo.count({
            where: { detectiveId, status: "rejected" },
        });
        const completedAssignments = await assignmentRepo.count({
            where: { detectiveId, status: "completed" },
        });
        // 현재 진행 중인 사건
        const activeCases = await assignmentRepo.find({
            where: { detectiveId, status: "accepted" },
            relations: ["case"],
            order: { assignedAt: "DESC" },
        });
        // 최근 완료된 사건
        const recentCompleted = await assignmentRepo.find({
            where: { detectiveId, status: "completed" },
            relations: ["case"],
            order: { completedAt: "DESC" },
            take: 5,
        });
        // 월별 성과 (최근 6개월)
        const monthlyPerformance = await assignmentRepo
            .createQueryBuilder("assignment")
            .select("strftime('%Y-%m', assignment.completedAt)", "month")
            .addSelect("COUNT(*)", "completed")
            .where("assignment.detectiveId = :detectiveId", { detectiveId })
            .andWhere("assignment.status = :status", { status: "completed" })
            .andWhere("assignment.completedAt >= date('now', '-6 months')")
            .groupBy("month")
            .orderBy("month", "DESC")
            .getRawMany();
        res.json({
            detective: {
                id: detective.id,
                name: detective.name,
                status: detective.status,
                experienceYears: detective.experienceYears,
                averageRating: detective.averageRating,
                successRate: detective.successRate,
                completedCases: detective.completedCases,
                currentCaseCount: detective.currentCaseCount,
                maxConcurrentCases: detective.maxConcurrentCases,
                utilization: ((detective.currentCaseCount / detective.maxConcurrentCases) *
                    100).toFixed(1),
            },
            assignments: {
                total: totalAssignments,
                accepted: acceptedAssignments,
                rejected: rejectedAssignments,
                completed: completedAssignments,
                acceptanceRate: totalAssignments > 0
                    ? ((acceptedAssignments / totalAssignments) * 100).toFixed(1)
                    : "0",
            },
            activeCases: activeCases.map((a) => ({
                assignmentId: a.id,
                caseId: a.caseId,
                caseTitle: a.case?.title,
                assignedAt: a.assignedAt,
                priority: a.priority,
            })),
            recentCompleted: recentCompleted.map((a) => ({
                assignmentId: a.id,
                caseId: a.caseId,
                caseTitle: a.case?.title,
                completedAt: a.completedAt,
            })),
            monthlyPerformance,
        });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * GET /api/dashboard/trends - 트렌드 분석 (관리자 전용)
 */
router.get("/trends", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const caseRepo = database_1.AppDataSource.getRepository(Case_1.Case);
        const assignmentRepo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
        // 월별 사건 추이 (최근 12개월)
        const monthlyCases = await caseRepo
            .createQueryBuilder("case")
            .select("strftime('%Y-%m', case.createdAt)", "month")
            .addSelect("COUNT(*)", "count")
            .where("case.createdAt >= date('now', '-12 months')")
            .groupBy("month")
            .orderBy("month", "ASC")
            .getRawMany();
        // 카테고리별 사건 분포
        const casesByCategory = await caseRepo
            .createQueryBuilder("case")
            .select("case.category", "category")
            .addSelect("COUNT(*)", "count")
            .groupBy("case.category")
            .getRawMany();
        // 배정 성공률 추이
        const assignmentTrends = await assignmentRepo
            .createQueryBuilder("assignment")
            .select("strftime('%Y-%m', assignment.createdAt)", "month")
            .addSelect("COUNT(*)", "total")
            .addSelect("SUM(CASE WHEN assignment.status = 'accepted' THEN 1 ELSE 0 END)", "accepted")
            .where("assignment.createdAt >= date('now', '-6 months')")
            .groupBy("month")
            .orderBy("month", "ASC")
            .getRawMany();
        res.json({
            monthlyCases,
            casesByCategory,
            assignmentTrends: assignmentTrends.map((t) => ({
                month: t.month,
                total: parseInt(t.total),
                accepted: parseInt(t.accepted),
                acceptanceRate: ((parseInt(t.accepted) / parseInt(t.total)) *
                    100).toFixed(1),
            })),
        });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * GET /api/dashboard - 간단한 대시보드 (인증 불필요 - 개발용)
 */
router.get("/", async (req, res) => {
    try {
        const detectiveRepo = database_1.AppDataSource.getRepository(Detective_1.Detective);
        const assignmentRepo = database_1.AppDataSource.getRepository(CaseAssignment_1.CaseAssignment);
        // 첫 번째 탐정 정보 가져오기
        const detective = await detectiveRepo.findOne({
            where: {},
            order: { id: "ASC" },
        });
        if (!detective) {
            return res.status(404).json({ error: "No detective found" });
        }
        // 배정 통계
        const assignments = await assignmentRepo.find({
            where: { detectiveId: detective.id },
        });
        const total = assignments.length;
        const accepted = assignments.filter((a) => a.status === "accepted").length;
        const rejected = assignments.filter((a) => a.status === "rejected").length;
        const completed = assignments.filter((a) => a.status === "completed").length;
        const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
        // 진행 중 사건
        const activeCases = await assignmentRepo.find({
            where: { detectiveId: detective.id, status: "accepted" },
            relations: ["case"],
            take: 5,
        });
        // 최근 완료 사건
        const recentCompleted = await assignmentRepo.find({
            where: { detectiveId: detective.id, status: "completed" },
            relations: ["case"],
            order: { completedAt: "DESC" },
            take: 5,
        });
        // 월별 성과 (더미 데이터)
        const monthlyPerformance = [
            { month: "2024-06", completed: 12 },
            { month: "2024-07", completed: 15 },
            { month: "2024-08", completed: 18 },
            { month: "2024-09", completed: 14 },
            { month: "2024-10", completed: 16 },
            { month: "2024-11", completed: 10 },
        ];
        res.json({
            detective: {
                name: detective.name,
                status: detective.status,
                experienceYears: detective.experienceYears,
                averageRating: detective.averageRating,
                successRate: detective.successRate,
                completedCases: detective.completedCases,
                currentCaseCount: detective.currentCaseCount,
                maxConcurrentCases: detective.maxConcurrentCases,
                utilization: Math.round((detective.currentCaseCount / detective.maxConcurrentCases) * 100),
            },
            assignments: {
                total,
                accepted,
                rejected,
                completed,
                acceptanceRate,
            },
            activeCases: activeCases.map((a) => ({
                assignmentId: a.id,
                caseId: a.caseId,
                caseTitle: a.case?.title || "N/A",
                assignedAt: a.assignedAt?.toISOString().split("T")[0],
                priority: a.priority,
            })),
            recentCompleted: recentCompleted.map((a) => ({
                assignmentId: a.id,
                caseId: a.caseId,
                caseTitle: a.case?.title || "N/A",
                completedAt: a.completedAt?.toISOString().split("T")[0],
            })),
            monthlyPerformance,
        });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
exports.default = router;
