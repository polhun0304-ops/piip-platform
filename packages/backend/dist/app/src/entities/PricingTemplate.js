"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingTemplate = void 0;
const typeorm_1 = require("typeorm");
/**
 * 가격표 템플릿
 * 업무별 기본 가격 및 옵션별 추가 비용 관리
 */
let PricingTemplate = class PricingTemplate {
};
exports.PricingTemplate = PricingTemplate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], PricingTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], PricingTemplate.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], PricingTemplate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], PricingTemplate.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], PricingTemplate.prototype, "basePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, default: "per_case" }),
    __metadata("design:type", String)
], PricingTemplate.prototype, "priceUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], PricingTemplate.prototype, "estimatedDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Array)
], PricingTemplate.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Array)
], PricingTemplate.prototype, "includedServices", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], PricingTemplate.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], PricingTemplate.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PricingTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PricingTemplate.prototype, "updatedAt", void 0);
exports.PricingTemplate = PricingTemplate = __decorate([
    (0, typeorm_1.Entity)()
], PricingTemplate);
