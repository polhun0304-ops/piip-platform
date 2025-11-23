"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const PricingTemplate_1 = require("../entities/PricingTemplate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/pricing - 가격표 목록 조회 (공개)
 * ?category=불륜조사
 * ?isActive=true
 */
router.get("/", async (req, res) => {
    try {
        const { category, isActive } = req.query;
        const repo = database_1.AppDataSource.getRepository(PricingTemplate_1.PricingTemplate);
        const queryBuilder = repo.createQueryBuilder("pricing");
        if (category) {
            queryBuilder.andWhere("pricing.category = :category", { category });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere("pricing.isActive = :isActive", {
                isActive: isActive === "true",
            });
        }
        const pricings = await queryBuilder
            .orderBy("pricing.sortOrder", "ASC")
            .addOrderBy("pricing.category", "ASC")
            .getMany();
        res.json(pricings);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * GET /api/pricing/:id - 가격표 상세 조회
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const repo = database_1.AppDataSource.getRepository(PricingTemplate_1.PricingTemplate);
        const pricing = await repo.findOne({ where: { id } });
        if (!pricing) {
            return res.status(404).json({ error: "Pricing template not found" });
        }
        res.json(pricing);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * POST /api/pricing - 가격표 생성 (관리자 전용)
 */
router.post("/", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { category, name, description, basePrice, priceUnit, estimatedDays, options, includedServices, sortOrder, } = req.body;
        if (!category || !name || basePrice === undefined) {
            return res.status(400).json({
                error: "category, name, basePrice are required",
            });
        }
        const repo = database_1.AppDataSource.getRepository(PricingTemplate_1.PricingTemplate);
        const pricing = repo.create({
            category,
            name,
            description,
            basePrice,
            priceUnit: priceUnit || "per_case",
            estimatedDays,
            options: options || [],
            includedServices: includedServices || [],
            sortOrder: sortOrder || 0,
            isActive: true,
        });
        const saved = await repo.save(pricing);
        res.status(201).json(saved);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * PUT /api/pricing/:id - 가격표 수정 (관리자 전용)
 */
router.put("/:id", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { category, name, description, basePrice, priceUnit, estimatedDays, options, includedServices, isActive, sortOrder, } = req.body;
        const repo = database_1.AppDataSource.getRepository(PricingTemplate_1.PricingTemplate);
        const pricing = await repo.findOne({ where: { id } });
        if (!pricing) {
            return res.status(404).json({ error: "Pricing template not found" });
        }
        repo.merge(pricing, {
            category,
            name,
            description,
            basePrice,
            priceUnit,
            estimatedDays,
            options,
            includedServices,
            isActive,
            sortOrder,
        });
        const updated = await repo.save(pricing);
        res.json(updated);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * DELETE /api/pricing/:id - 가격표 삭제 (관리자 전용)
 */
router.delete("/:id", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const repo = database_1.AppDataSource.getRepository(PricingTemplate_1.PricingTemplate);
        const result = await repo.delete(id);
        if (result.affected === 0) {
            return res.status(404).json({ error: "Pricing template not found" });
        }
        res.json({ message: "Pricing template deleted successfully" });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
/**
 * PATCH /api/pricing/:id/activate - 가격표 활성화/비활성화 (관리자 전용)
 */
router.patch("/:id/activate", auth_1.verifyJWT, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        if (isActive === undefined) {
            return res.status(400).json({ error: "isActive is required" });
        }
        const repo = database_1.AppDataSource.getRepository(PricingTemplate_1.PricingTemplate);
        const pricing = await repo.findOne({ where: { id } });
        if (!pricing) {
            return res.status(404).json({ error: "Pricing template not found" });
        }
        pricing.isActive = isActive;
        const updated = await repo.save(pricing);
        res.json(updated);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg || "Internal server error" });
    }
});
exports.default = router;
