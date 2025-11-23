"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const Detective_1 = require("../entities/Detective");
const router = (0, express_1.Router)();
/**
 * GET /api/detectives/match - 조건 기반 탐정 자동 추천
 * Query: region, city, specialty, minExperience, minRating, minSuccessRate
 * 우선순위: 지역 > 전문분야 > 경력 > 평점 > 성공률 > 현재 담당 건수
 */
router.get("/", async (req, res) => {
    try {
        const { region, city, specialty, minExperience, minRating, minSuccessRate, } = req.query;
        const repo = database_1.AppDataSource.getRepository(Detective_1.Detective);
        let queryBuilder = repo.createQueryBuilder("detective");
        if (region)
            queryBuilder = queryBuilder.andWhere("detective.region = :region", {
                region,
            });
        if (city)
            queryBuilder = queryBuilder.andWhere("detective.city = :city", { city });
        if (specialty)
            queryBuilder = queryBuilder.andWhere("detective.specialties LIKE :specialty", { specialty: `%"category":"${specialty}"%` });
        if (minExperience)
            queryBuilder = queryBuilder.andWhere("detective.experienceYears >= :minExperience", { minExperience });
        if (minRating)
            queryBuilder = queryBuilder.andWhere("detective.averageRating >= :minRating", { minRating });
        if (minSuccessRate)
            queryBuilder = queryBuilder.andWhere("detective.successRate >= :minSuccessRate", { minSuccessRate });
        // 우선순위 정렬: 지역 > 전문분야 > 경력 > 평점 > 성공률 > 현재 담당 건수
        queryBuilder = queryBuilder
            .orderBy("detective.region", "ASC")
            .addOrderBy("detective.city", "ASC")
            .addOrderBy("detective.experienceYears", "DESC")
            .addOrderBy("detective.averageRating", "DESC")
            .addOrderBy("detective.successRate", "DESC")
            .addOrderBy("detective.currentCaseCount", "ASC");
        const detectives = await queryBuilder.getMany();
        res.json(detectives);
    }
    catch (e) {
        res
            .status(500)
            .json({ error: e.message || "Internal server error" });
    }
});
exports.default = router;
