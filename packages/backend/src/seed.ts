/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { config } from "dotenv";
import { AppDataSource } from "./config/database";
import { Case } from "./entities/Case";
import { Evidence } from "./entities/Evidence";
import { User } from "./entities/User";
import { PricingTemplate } from "./entities/PricingTemplate";
import { Quote } from "./entities/Quote";
import { Consultation } from "./entities/Consultation";
import { Detective } from "./entities/Detective";
import * as bcrypt from "bcryptjs";

config();

async function seedDatabase() {
  try {
    // DB 연결 먼저
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const userRepository = AppDataSource.getRepository(User);
    const pricingRepository = AppDataSource.getRepository(PricingTemplate);
    const caseRepository = AppDataSource.getRepository(Case);
    const evidenceRepository = AppDataSource.getRepository(Evidence);
    const quoteRepository = AppDataSource.getRepository(Quote);
    const consultationRepository = AppDataSource.getRepository(Consultation);
    // Detective repository might be needed if we want to clear it,
    // but let's try clearing dependent tables first.
    // If Detective exists and links to User, we might need to clear it too.
    // Let's assume for now we just clear what we create.

    console.log("🔁 Seeding in idempotent mode (upsert / skip existing)");
    // NOTE: Do NOT perform global clears here. Instead, create or update
    // only the test data we need so re-running the seeder is safe in CI.

    // Admin 계정 생성(업서트)
    const adminEmail = "admin@piip.com";
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash("admin123!@#", 10);
      const admin = userRepository.create({
        email: adminEmail,
        password: adminPassword,
        name: "관리자",
        phone: "010-0000-0000",
        role: "admin",
        isActive: true,
      });
      await userRepository.save(admin);
      console.log("✅ Created admin account: admin@piip.com");
    } else {
      console.log("⏭️  Admin account already exists: admin@piip.com");
    }

    // 회원(User) 10개 생성
    // Ensure test users map 1->client, 2->detective, 3->admin
    const userRoles: Array<"admin" | "detective" | "client"> = [
      "client",
      "detective",
      "admin",
    ];
    const userArr: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const hashedPassword = await bcrypt.hash(`hashedpassword${i}`, 10);
      userArr.push({
        email: `testuser${i}@piip.com`,
        password: hashedPassword,
        name: `테스트회원${i}`,
        phone: `010-1000-${(1000 + i).toString().padStart(4, "0")}`,
        role: userRoles[(i - 1) % userRoles.length],
        isActive: true,
      });
    }
    // Create or skip test users by email (idempotent)
    const createdUsers = [];
    for (const u of userArr) {
      const exists = await userRepository.findOne({
        where: { email: u.email },
      });
      if (!exists) {
        const created = await userRepository.save(u);
        createdUsers.push(created);
        console.log(`✅ Created test user: ${u.email}`);
      } else {
        console.log(`⏭️  Test user exists: ${u.email}`);
      }
    }
    console.log(`ℹ️  Test users ensured (created ${createdUsers.length})`);

    // Load users from DB for downstream associations (cases, consultations, etc.)
    const users = await userRepository.find();
    // Ensure Detective entities exist for users with role 'detective'
    const detectiveRepository = AppDataSource.getRepository(Detective);
    const detectiveUsers = users.filter((u) => u.role === "detective");
    for (const du of detectiveUsers) {
      // Try to find existing detective by userId or email
      let det = await detectiveRepository.findOne({
        where: [{ userId: du.id }, { email: du.email }],
      });
      if (!det) {
        det = detectiveRepository.create({
          userId: du.id,
          name: du.name || `탐정 ${du.email}`,
          email: du.email,
          phone: du.phone || undefined,
          licenseNumber: `DET-${Math.floor(1000 + Math.random() * 9000)}`,
          experienceYears: 3,
          status: "활동중",
          specialties: [],
        });
        await detectiveRepository.save(det);
        console.log(`✅ Created Detective profile for user ${du.email}`);
      } else if (!det.userId) {
        // Link existing detective record to user
        det.userId = du.id;
        await detectiveRepository.save(det);
        console.log(`🔗 Linked Detective ${det.id} to user ${du.email}`);
      }

      // Ensure user's detectiveId is set
      if (!du.detectiveId) {
        du.detectiveId = det.id;
        await userRepository.save(du);
        console.log(`🔗 Set user.detectiveId for ${du.email} -> ${det.id}`);
      }
    }

    // 가격표(PricingTemplate) 5개 생성
    const pricingArr: any[] = [];
    for (let i = 1; i <= 5; i++) {
      pricingArr.push({
        category: ["불륜조사", "소재파악", "신원조사", "기업조사", "기타"][
          i % 5
        ],
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
    // Pricing templates: create if missing by name
    const ensuredPricings = [];
    for (const p of pricingArr) {
      const exists = await pricingRepository.findOne({
        where: { name: p.name },
      });
      if (!exists) {
        const saved = await pricingRepository.save(p);
        ensuredPricings.push(saved);
        console.log(`✅ Created pricing template: ${p.name}`);
      } else {
        ensuredPricings.push(exists);
        console.log(`⏭️  Pricing template exists: ${p.name}`);
      }
    }
    console.log(`ℹ️  Pricing templates ensured (${ensuredPricings.length})`);

    // 기존 데이터 삭제 (전체 삭제)
    // await evidenceRepository.clear(); // Already cleared
    // await caseRepository.clear(); // Already cleared
    // console.log("🗑️  Cleared existing data");

    // 사건 25개 생성
    const caseArr: any[] = [];
    const statusArr: Array<"조사 중" | "대기" | "종료"> = [
      "조사 중",
      "대기",
      "종료",
    ];
    const clientUsers = users.filter((u) => u.role === "client");

    // Create cases only if a case with the same title doesn't exist
    const cases: any[] = [];
    for (let i = 1; i <= 25; i++) {
      const title = `테스트 사건 #${i}`;
      const exists = await caseRepository.findOne({ where: { title } });
      if (!exists) {
        const newCase: any = {
          title,
          description: `테스트용 사건 설명 ${i}번. 다양한 유형의 사건 자동 생성.`,
          status: statusArr[i % statusArr.length],
          date: `2025-11-${((i % 28) + 1).toString().padStart(2, "0")}`,
        };
        if (clientUsers.length > 0) {
          newCase.clientUserId = clientUsers[i % clientUsers.length].id;
        }
        const saved = await caseRepository.save(newCase as any);
        cases.push(saved);
        console.log(`✅ Created case: ${title}`);
      } else {
        cases.push(exists);
        console.log(`⏭️  Case exists: ${title}`);
      }
    }
    console.log(`ℹ️  Cases ensured (${cases.length})`);

    // 증거 25개 생성 (각 사건에 1개씩)
    const evidenceArr: any[] = [];
    const typeArr: Array<"이미지" | "오디오" | "문서" | "비디오"> = [
      "이미지",
      "오디오",
      "문서",
      "비디오",
    ];
    // Evidence: create one evidence per case if not exists for that case+label
    for (let i = 0; i < cases.length; i++) {
      const label = `테스트 증거 #${i + 1}`;
      const exists = await evidenceRepository.findOne({
        where: { label, caseId: cases[i].id },
      });
      if (!exists) {
        const ev = {
          label,
          type: typeArr[i % typeArr.length],
          date: `2025-11-${(((i * 2) % 28) + 1).toString().padStart(2, "0")}`,
          caseId: cases[i].id,
        };
        await evidenceRepository.save(ev);
        console.log(`✅ Created evidence: ${label} for case ${cases[i].id}`);
      } else {
        console.log(`⏭️  Evidence exists: ${label} for case ${cases[i].id}`);
      }
    }

    // 견적(Quote) 5개 생성 (사건과 가격표 연동) - 사건(cases) 생성 이후에 실행
    const quoteArr: any[] = [];
    // Quotes: create if missing by caseId & pricingTemplateId
    for (
      let i = 0;
      i < Math.min(5, cases.length, ensuredPricings.length);
      i++
    ) {
      const caseId = cases[i].id;
      const pricingId = ensuredPricings[i].id;
      const exists = await quoteRepository.findOne({
        where: { caseId, pricingTemplateId: pricingId },
      });
      if (!exists) {
        const q = {
          caseId,
          pricingTemplateId: pricingId,
          status: "sent",
          basePrice: ensuredPricings[i].basePrice,
          items: [
            { name: "항목A", quantity: 1, unitPrice: 50000, totalPrice: 50000 },
            { name: "항목B", quantity: 2, unitPrice: 30000, totalPrice: 60000 },
          ],
          selectedOptions: ["추가옵션A"],
          totalPrice: ensuredPricings[i].basePrice + 110000,
          discount: 10000,
          finalPrice: ensuredPricings[i].basePrice + 100000,
          estimatedDays: 5,
          notes: `테스트 견적 메모 ${i + 1}`,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        await quoteRepository.save(q as any);
        console.log(`✅ Created quote for case ${caseId}`);
      } else {
        console.log(`⏭️  Quote exists for case ${caseId}`);
      }
    }

    // 상담(Consultation) 10개 생성 (회원/사건 연동)
    const consultationArr: any[] = [];
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
    // Consultations: create if missing by meetingUrl
    let createdConsultations = 0;
    for (const c of consultationArr) {
      const exists = await consultationRepository.findOne({
        where: { meetingUrl: c.meetingUrl },
      });
      if (!exists) {
        await consultationRepository.save(c);
        createdConsultations++;
        console.log(`✅ Created consultation: ${c.meetingUrl}`);
      } else {
        console.log(`⏭️  Consultation exists: ${c.meetingUrl}`);
      }
    }
    console.log(`ℹ️  Consultations ensured (created ${createdConsultations})`);

    console.log("✅ Database seeded with 50+ test items!");

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    try {
      await AppDataSource.destroy();
    } catch (e) {
      console.warn(
        "Error while destroying AppDataSource after seed failure:",
        e
      );
    }
    process.exit(1);
  }
}

seedDatabase();
