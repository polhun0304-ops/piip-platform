"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Case_1 = require("../entities/Case");
const Evidence_1 = require("../entities/Evidence");
const AnalysisJob_1 = require("../entities/AnalysisJob");
const AnalysisArtifact_1 = require("../entities/AnalysisArtifact");
const RequestTemplate_1 = require("../entities/RequestTemplate");
const IntakeSession_1 = require("../entities/IntakeSession");
const IntakeResponse_1 = require("../entities/IntakeResponse");
const Detective_1 = require("../entities/Detective");
const CaseAssignment_1 = require("../entities/CaseAssignment");
const User_1 = require("../entities/User");
const PricingTemplate_1 = require("../entities/PricingTemplate");
const Quote_1 = require("../entities/Quote");
const Consultation_1 = require("../entities/Consultation");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: "piip.db",
    synchronize: true, // 개발 환경에서만 true, 프로덕션에서는 migration 사용
    logging: true,
    entities: [
        Case_1.Case,
        Evidence_1.Evidence,
        AnalysisJob_1.AnalysisJob,
        AnalysisArtifact_1.AnalysisArtifact,
        RequestTemplate_1.RequestTemplate,
        IntakeSession_1.IntakeSession,
        IntakeResponse_1.IntakeResponse,
        Detective_1.Detective,
        CaseAssignment_1.CaseAssignment,
        User_1.User,
        PricingTemplate_1.PricingTemplate,
        Quote_1.Quote,
        Consultation_1.Consultation,
    ],
    migrations: [],
    subscribers: [],
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log("✅ Database initialized successfully");
        // Seed admin user
        const { seedAdminUser } = await Promise.resolve().then(() => __importStar(require("../services/seedAdmin")));
        await seedAdminUser();
        // Seed request templates on first run
        const { seedRequestTemplates } = await Promise.resolve().then(() => __importStar(require("../services/seedTemplates")));
        await seedRequestTemplates();
        // Seed sample detectives
        const { seedDetectives } = await Promise.resolve().then(() => __importStar(require("../services/seedDetectives")));
        await seedDetectives();
    }
    catch (error) {
        console.error("❌ Error during database initialization:", error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
