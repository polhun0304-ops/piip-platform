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
exports.CaseAssignment = void 0;
const typeorm_1 = require("typeorm");
const Case_1 = require("./Case");
const Detective_1 = require("./Detective");
/**
 * 사건 배정 기록
 */
let CaseAssignment = class CaseAssignment {
};
exports.CaseAssignment = CaseAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CaseAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], CaseAssignment.prototype, "caseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Case_1.Case),
    (0, typeorm_1.JoinColumn)({ name: "caseId" }),
    __metadata("design:type", Case_1.Case)
], CaseAssignment.prototype, "case", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], CaseAssignment.prototype, "detectiveId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Detective_1.Detective, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "detectiveId" }),
    __metadata("design:type", Detective_1.Detective)
], CaseAssignment.prototype, "detective", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], CaseAssignment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "auto" }),
    __metadata("design:type", String)
], CaseAssignment.prototype, "assignmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    __metadata("design:type", Number)
], CaseAssignment.prototype, "matchScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], CaseAssignment.prototype, "matchReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], CaseAssignment.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], CaseAssignment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], CaseAssignment.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CaseAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CaseAssignment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], CaseAssignment.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], CaseAssignment.prototype, "respondedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], CaseAssignment.prototype, "completedAt", void 0);
exports.CaseAssignment = CaseAssignment = __decorate([
    (0, typeorm_1.Entity)()
], CaseAssignment);
