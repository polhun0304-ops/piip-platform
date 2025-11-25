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
/* eslint-disable @typescript-eslint/no-explicit-any */
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const database_1 = require("./config/database");
const Case_1 = require("./entities/Case");
const Evidence_1 = require("./entities/Evidence");
const User_1 = require("./entities/User");
const PricingTemplate_1 = require("./entities/PricingTemplate");
const Quote_1 = require("./entities/Quote");
const Consultation_1 = require("./entities/Consultation");
const bcrypt = __importStar(require("bcryptjs"));
(0, dotenv_1.config)();
async function seedDatabase() {
    try {
        // DB 연결 먼저
        await database_1.AppDataSource.initialize();
        console.log("✅ Database connected");
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const pricingRepository = database_1.AppDataSource.getRepository(PricingTemplate_1.PricingTemplate);
        const caseRepository = database_1.AppDataSource.getRepository(Case_1.Case);
        const evidenceRepository = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const quoteRepository = database_1.AppDataSource.getRepository(Quote_1.Quote);
        const consultationRepository = database_1.AppDataSource.getRepository(Consultation_1.Consultation);
        // Detective repository might be needed if we want to clear it,
        // but let's try clearing dependent tables first.
        // If Detective exists and links to User, we might need to clear it too.
        // Let's assume for now we just clear what we create.
        console.log("🗑️  Clearing existing data...");
        // Delete in order of dependency (Child -> Parent)
        await evidenceRepository.clear();
        await quoteRepository.clear();
        await consultationRepository.clear();
        await caseRepository.clear();
        await pricingRepository.clear();
        await userRepository.clear();
        console.log("✅ Existing data cleared");
        // Admin 계정 생성
        const adminPassword = await bcrypt.hash("admin123!@#", 10);
        const admin = userRepository.create({
            email: "admin@piip.com",
            password: adminPassword,
            name: "관리자",
            phone: "010-0000-0000",
            role: "admin",
            isActive: true,
        });
        await userRepository.save(admin);
        console.log("✅ Created admin account: admin@piip.com");
        // 회원(User) 10개 생성
        // Ensure test users map 1->client, 2->detective, 3->admin
        const userRoles = [
            "client",
            "detective",
            "admin",
        ];
        const userArr = [];
        for (let i = 1; i <= 10; i++) {
            const hashedPassword = await bcrypt.hash(`hashedpassword${i}`, 10);
            userArr.push({
                email: `testuser${i}@piip.com`,
                password: hashedPassword,
                name: `테스트회원${i}`,
                phone: `010-1000-${(1000 + i).toString().padStart(4, "0")}`,
                role: userRoles[i % userRoles.length],
                isActive: true,
            });
        }
        const users = await userRepository.save(userArr);
        console.log(`✅ Created ${users.length} test users`);
        // 가격표(PricingTemplate) 5개 생성
        const pricingArr = [];
        for (let i = 1; i <= 5; i++) {
            pricingArr.push({
                category: ["불륜조사", "소재파악", "신원조사", "기업조사", "기타"][i % 5],
                name: `가격표템플릿${i}`,
                description: `테스트용 가격표 설명 ${i}`,
                basePrice: 100000 + i * 50000,
                priceUnit: "per_case",
                estimatedDays: 3 + i,
                options: [
                    {
                        name: "추가옵션A",
                        quantity: 1,
                        unitPrice: 20000,
                        totalPrice: 20000,
                    },
                    {
                        name: "추가옵션B",
                        quantity: 2,
                        unitPrice: 15000,
                        totalPrice: 30000,
                    },
                ],
                includedServices: ["기본서비스A", "기본서비스B"],
            });
        }
        const pricings = await pricingRepository.save(pricingArr);
        console.log(`✅ Created ${pricings.length} pricing templates`);
        // 기존 데이터 삭제 (전체 삭제)
        // await evidenceRepository.clear(); // Already cleared
        // await caseRepository.clear(); // Already cleared
        // console.log("🗑️  Cleared existing data");
        // 사건 25개 생성
        const caseArr = [];
        const statusArr = [
            "조사 중",
            "대기",
            "종료",
        ];
        const clientUsers = users.filter((u) => u.role === "client");
        for (let i = 1; i <= 25; i++) {
            caseArr.push({
                title: `테스트 사건 #${i}`,
                description: `테스트용 사건 설명 ${i}번. 다양한 유형의 사건 자동 생성.`,
                status: statusArr[i % statusArr.length],
                date: `2025-11-${((i % 28) + 1).toString().padStart(2, "0")}`,
                clientUserId: clientUsers.length > 0
                    ? clientUsers[i % clientUsers.length].id
                    : null,
            });
        }
        const cases = await caseRepository.save(caseArr);
        console.log(`✅ Created ${cases.length} cases`);
        // 증거 25개 생성 (각 사건에 1개씩)
        const evidenceArr = [];
        const typeArr = [
            "이미지",
            "오디오",
            "문서",
            "비디오",
        ];
        for (let i = 0; i < 25; i++) {
            evidenceArr.push({
                label: `테스트 증거 #${i + 1}`,
                type: typeArr[i % typeArr.length],
                date: `2025-11-${(((i * 2) % 28) + 1).toString().padStart(2, "0")}`,
                caseId: cases[i].id,
            });
        }
        const evidence = await evidenceRepository.save(evidenceArr);
        console.log(`✅ Created ${evidence.length} evidence items`);
        // 견적(Quote) 5개 생성 (사건과 가격표 연동) - 사건(cases) 생성 이후에 실행
        const quoteArr = [];
        for (let i = 0; i < 5; i++) {
            quoteArr.push({
                caseId: cases[i].id,
                pricingTemplateId: pricings[i].id,
                status: "sent",
                basePrice: pricings[i].basePrice,
                items: [
                    { name: "항목A", quantity: 1, unitPrice: 50000, totalPrice: 50000 },
                    { name: "항목B", quantity: 2, unitPrice: 30000, totalPrice: 60000 },
                ],
                selectedOptions: ["추가옵션A"],
                totalPrice: pricings[i].basePrice + 110000,
                discount: 10000,
                finalPrice: pricings[i].basePrice + 100000,
                estimatedDays: 5,
                notes: `테스트 견적 메모 ${i + 1}`,
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
        }
        const quotes = await quoteRepository.save(quoteArr);
        console.log(`✅ Created ${quotes.length} quotes`);
        // 상담(Consultation) 10개 생성 (회원/사건 연동)
        const consultationArr = [];
        for (let i = 0; i < 10; i++) {
            consultationArr.push({
                clientUserId: users[i % users.length].id,
                detectiveId: null,
                caseId: cases[i % cases.length].id,
                type: i % 2 === 0 ? "free15" : "paid30",
                channel: i % 2 === 0 ? "video" : "voice",
                timezone: "Asia/Seoul",
                scheduledAt: new Date(Date.now() + (i + 1) * 3600 * 1000),
                durationMinutes: i % 2 === 0 ? 15 : 30,
                status: "scheduled",
                legalAdviceDisclaimerAck: true,
                recordingConsent: false,
                privacyPolicyAck: true,
                meetingUrl: `https://meet.piip.com/test${i}`,
                manageUrl: `https://manage.piip.com/test${i}`,
                summaryNote: `상담 요약 ${i + 1}`,
                clientContact: users[i % users.length].phone,
                clientEmail: users[i % users.length].email,
                notes: `상담 추가 노트 ${i + 1}`,
                duration: i % 2 === 0 ? 15 : 30,
                startedAt: null,
                completedAt: null,
            });
        }
        const consultations = await consultationRepository.save(consultationArr);
        console.log(`✅ Created ${consultations.length} consultations`);
        console.log("✅ Database seeded with 50+ test items!");
        await database_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        try {
            await database_1.AppDataSource.destroy();
        }
        catch (e) {
            console.warn("Error while destroying AppDataSource after seed failure:", e);
        }
        process.exit(1);
    }
}
seedDatabase();
