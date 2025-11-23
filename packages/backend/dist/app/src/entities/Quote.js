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
exports.Quote = void 0;
const typeorm_1 = require("typeorm");
const Case_1 = require("./Case");
const PricingTemplate_1 = require("./PricingTemplate");
/**
 * 견적서 엔티티
 * 사건별 견적 정보 관리
 */
let Quote = class Quote {
};
exports.Quote = Quote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Quote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], Quote.prototype, "caseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Case_1.Case),
    (0, typeorm_1.JoinColumn)({ name: "caseId" }),
    __metadata("design:type", Case_1.Case)
], Quote.prototype, "case", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], Quote.prototype, "pricingTemplateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PricingTemplate_1.PricingTemplate, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "pricingTemplateId" }),
    __metadata("design:type", PricingTemplate_1.PricingTemplate)
], Quote.prototype, "pricingTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], Quote.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Quote.prototype, "basePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Array)
], Quote.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Array)
], Quote.prototype, "selectedOptions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Quote.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Quote.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Quote.prototype, "finalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Quote.prototype, "estimatedDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Quote.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], Quote.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], Quote.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Quote.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Quote.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Quote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Quote.prototype, "updatedAt", void 0);
exports.Quote = Quote = __decorate([
    (0, typeorm_1.Entity)()
], Quote);
