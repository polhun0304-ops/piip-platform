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
exports.AnalysisJob = void 0;
const typeorm_1 = require("typeorm");
const Evidence_1 = require("./Evidence");
let AnalysisJob = class AnalysisJob {
};
exports.AnalysisJob = AnalysisJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], AnalysisJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], AnalysisJob.prototype, "evidenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], AnalysisJob.prototype, "caseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Evidence_1.Evidence, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "evidenceId" }),
    __metadata("design:type", Evidence_1.Evidence)
], AnalysisJob.prototype, "evidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], AnalysisJob.prototype, "jobType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], AnalysisJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], AnalysisJob.prototype, "resultSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], AnalysisJob.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AnalysisJob.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AnalysisJob.prototype, "updatedAt", void 0);
exports.AnalysisJob = AnalysisJob = __decorate([
    (0, typeorm_1.Entity)("analysis_job")
], AnalysisJob);
