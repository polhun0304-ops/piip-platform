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
exports.RequestTemplate = void 0;
const typeorm_1 = require("typeorm");
/**
 * 의뢰 유형별 표준 템플릿
 * 예: 불륜조사, 소재파악, 신원조사 등
 */
let RequestTemplate = class RequestTemplate {
};
exports.RequestTemplate = RequestTemplate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], RequestTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, unique: true }),
    __metadata("design:type", String)
], RequestTemplate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], RequestTemplate.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Array)
], RequestTemplate.prototype, "fields", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json", nullable: true }),
    __metadata("design:type", Array)
], RequestTemplate.prototype, "conversationFlow", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], RequestTemplate.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], RequestTemplate.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RequestTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RequestTemplate.prototype, "updatedAt", void 0);
exports.RequestTemplate = RequestTemplate = __decorate([
    (0, typeorm_1.Entity)()
], RequestTemplate);
