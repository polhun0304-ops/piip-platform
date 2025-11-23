"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openapi = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yaml_1 = __importDefault(require("yaml"));
// OpenAPI YAML 로드
const specPath = path_1.default.join(__dirname, "../../../..", "docs", "openapi", "openapi.yaml");
const raw = fs_1.default.readFileSync(specPath, "utf8");
exports.openapi = yaml_1.default.parse(raw);
