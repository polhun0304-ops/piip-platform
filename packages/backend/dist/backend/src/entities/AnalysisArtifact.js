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
exports.AnalysisArtifact = void 0;
const typeorm_1 = require("typeorm");
const AnalysisJob_1 = require("./AnalysisJob");
let AnalysisArtifact = class AnalysisArtifact {
};
exports.AnalysisArtifact = AnalysisArtifact;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], AnalysisArtifact.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], AnalysisArtifact.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AnalysisJob_1.AnalysisJob, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "jobId" }),
    __metadata("design:type", AnalysisJob_1.AnalysisJob)
], AnalysisArtifact.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], AnalysisArtifact.prototype, "kind", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 500 }),
    __metadata("design:type", String)
], AnalysisArtifact.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AnalysisArtifact.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AnalysisArtifact.prototype, "updatedAt", void 0);
exports.AnalysisArtifact = AnalysisArtifact = __decorate([
    (0, typeorm_1.Entity)("analysis_artifact")
], AnalysisArtifact);
