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
exports.Case = void 0;
const typeorm_1 = require("typeorm");
const Evidence_1 = require("./Evidence");
const CaseAssignment_1 = require("./CaseAssignment");
let Case = class Case {
};
exports.Case = Case;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Case.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 500 }),
    __metadata("design:type", String)
], Case.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        length: 50,
        default: "조사 중",
    }),
    __metadata("design:type", String)
], Case.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "clientUserId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Case.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Case.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Evidence_1.Evidence, (evidence) => evidence.case),
    __metadata("design:type", Array)
], Case.prototype, "evidences", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CaseAssignment_1.CaseAssignment, (assignment) => assignment.case),
    __metadata("design:type", Array)
], Case.prototype, "assignments", void 0);
exports.Case = Case = __decorate([
    (0, typeorm_1.Entity)("cases")
], Case);
