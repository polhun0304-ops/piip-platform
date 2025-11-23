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
exports.IntakeSession = void 0;
const typeorm_1 = require("typeorm");
const RequestTemplate_1 = require("./RequestTemplate");
/**
 * 의뢰 접수 진행 세션
 * 의뢰인과 AI 에이전트의 대화 진행 상태 추적
 */
let IntakeSession = class IntakeSession {
};
exports.IntakeSession = IntakeSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], IntakeSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], IntakeSession.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RequestTemplate_1.RequestTemplate, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "templateId" }),
    __metadata("design:type", RequestTemplate_1.RequestTemplate)
], IntakeSession.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], IntakeSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], IntakeSession.prototype, "currentStep", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Object)
], IntakeSession.prototype, "collectedData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], IntakeSession.prototype, "clientContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], IntakeSession.prototype, "clientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], IntakeSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], IntakeSession.prototype, "createdCaseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], IntakeSession.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntakeSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], IntakeSession.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], IntakeSession.prototype, "completedAt", void 0);
exports.IntakeSession = IntakeSession = __decorate([
    (0, typeorm_1.Entity)()
], IntakeSession);
