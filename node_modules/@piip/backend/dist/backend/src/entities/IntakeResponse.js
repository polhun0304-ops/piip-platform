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
exports.IntakeResponse = void 0;
const typeorm_1 = require("typeorm");
const IntakeSession_1 = require("./IntakeSession");
/**
 * 의뢰 접수 대화 메시지 기록
 */
let IntakeResponse = class IntakeResponse {
};
exports.IntakeResponse = IntakeResponse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], IntakeResponse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], IntakeResponse.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => IntakeSession_1.IntakeSession),
    (0, typeorm_1.JoinColumn)({ name: "sessionId" }),
    __metadata("design:type", IntakeSession_1.IntakeSession)
], IntakeResponse.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], IntakeResponse.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], IntakeResponse.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], IntakeResponse.prototype, "extractedData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], IntakeResponse.prototype, "stepNumber", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntakeResponse.prototype, "createdAt", void 0);
exports.IntakeResponse = IntakeResponse = __decorate([
    (0, typeorm_1.Entity)()
], IntakeResponse);
