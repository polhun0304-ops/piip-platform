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
exports.Detective = void 0;
const typeorm_1 = require("typeorm");
/**
 * 탐정 프로필
 */
let Detective = class Detective {
};
exports.Detective = Detective;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Detective.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], Detective.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Detective.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", String)
], Detective.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Detective.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Detective.prototype, "licenseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", String)
], Detective.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30, nullable: true }),
    __metadata("design:type", String)
], Detective.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Detective.prototype, "experienceYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "활동중" }),
    __metadata("design:type", String)
], Detective.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Array)
], Detective.prototype, "specialties", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 5 }),
    __metadata("design:type", Number)
], Detective.prototype, "maxConcurrentCases", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Detective.prototype, "currentCaseCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", default: 0 }),
    __metadata("design:type", Number)
], Detective.prototype, "averageRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Detective.prototype, "completedCases", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Detective.prototype, "successRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Detective.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Object)
], Detective.prototype, "workingHours", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Detective.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Detective.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], Detective.prototype, "lastActiveAt", void 0);
exports.Detective = Detective = __decorate([
    (0, typeorm_1.Entity)()
], Detective);
