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
exports.Evidence = void 0;
const typeorm_1 = require("typeorm");
const Case_1 = require("./Case");
let Evidence = class Evidence {
};
exports.Evidence = Evidence;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Evidence.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 500 }),
    __metadata("design:type", String)
], Evidence.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        length: 50,
    }),
    __metadata("design:type", String)
], Evidence.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", String)
], Evidence.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 500, nullable: true }),
    __metadata("design:type", String)
], Evidence.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], Evidence.prototype, "caseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Case_1.Case, (caseEntity) => caseEntity.evidences, {
        onDelete: "SET NULL",
    }),
    (0, typeorm_1.JoinColumn)({ name: "caseId" }),
    __metadata("design:type", Case_1.Case)
], Evidence.prototype, "case", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Evidence.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Evidence.prototype, "updatedAt", void 0);
exports.Evidence = Evidence = __decorate([
    (0, typeorm_1.Entity)("evidence")
], Evidence);
