import { AppDataSource } from "../config/database";
import { Detective } from "../entities/Detective";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

/**
 * 샘플 탐정 시드 데이터
 */
export async function seedDetectives() {
  const repo = AppDataSource.getRepository(Detective);

  const detectives = [
    {
      name: "김철수",
      phone: "010-1111-2222",
      email: "kim@detective.com",
      licenseNumber: "DET-2018-001",
      experienceYears: 7,
      status: "활동중" as const,
      maxConcurrentCases: 8,
      currentCaseCount: 2,
      averageRating: 4.8,
      completedCases: 127,
      successRate: 92,
      bio: "불륜조사 전문. 7년 경력의 베테랑 탐정으로 높은 성공률을 자랑합니다.",
      specialties: [
        {
          category: "불륜조사",
          level: "전문가" as const,
          casesHandled: 85,
          successRate: 94,
        },
        {
          category: "소재파악",
          level: "고급" as const,
          casesHandled: 32,
          successRate: 88,
        },
      ],
    },
    {
      name: "박민지",
      phone: "010-3333-4444",
      email: "park@detective.com",
      licenseNumber: "DET-2019-015",
      experienceYears: 5,
      status: "활동중" as const,
      maxConcurrentCases: 6,
      currentCaseCount: 3,
      averageRating: 4.7,
      completedCases: 89,
      successRate: 90,
      bio: "신원조사 및 기업 조사 전문. 꼼꼼한 조사로 정평이 나 있습니다.",
      specialties: [
        {
          category: "신원조사",
          level: "전문가" as const,
          casesHandled: 56,
          successRate: 95,
        },
        {
          category: "불륜조사",
          level: "중급" as const,
          casesHandled: 23,
          successRate: 85,
        },
      ],
    },
    {
      name: "이영호",
      phone: "010-5555-6666",
      email: "lee@detective.com",
      licenseNumber: "DET-2020-028",
      experienceYears: 4,
      status: "활동중" as const,
      maxConcurrentCases: 5,
      currentCaseCount: 1,
      averageRating: 4.5,
      completedCases: 64,
      successRate: 87,
      bio: "소재파악 전문. IT 기술을 활용한 체계적인 조사를 수행합니다.",
      specialties: [
        {
          category: "소재파악",
          level: "전문가" as const,
          casesHandled: 48,
          successRate: 91,
        },
        {
          category: "신원조사",
          level: "중급" as const,
          casesHandled: 16,
          successRate: 82,
        },
      ],
    },
    {
      name: "정수연",
      phone: "010-7777-8888",
      email: "jung@detective.com",
      licenseNumber: "DET-2021-042",
      experienceYears: 3,
      status: "활동중" as const,
      maxConcurrentCases: 4,
      currentCaseCount: 0,
      averageRating: 4.6,
      completedCases: 42,
      successRate: 89,
      bio: "신입 탐정이지만 뛰어난 통찰력으로 빠르게 성장 중입니다.",
      specialties: [
        {
          category: "불륜조사",
          level: "중급" as const,
          casesHandled: 28,
          successRate: 88,
        },
        {
          category: "소재파악",
          level: "초급" as const,
          casesHandled: 14,
          successRate: 85,
        },
      ],
    },
    {
      name: "최동욱",
      phone: "010-9999-0000",
      email: "choi@detective.com",
      licenseNumber: "DET-2017-007",
      experienceYears: 8,
      status: "휴식중" as const,
      maxConcurrentCases: 7,
      currentCaseCount: 0,
      averageRating: 4.9,
      completedCases: 156,
      successRate: 94,
      bio: "업계 최고 경력. 현재 휴식 중이나 특별 사건은 수락 가능합니다.",
      specialties: [
        {
          category: "불륜조사",
          level: "전문가" as const,
          casesHandled: 92,
          successRate: 96,
        },
        {
          category: "신원조사",
          level: "전문가" as const,
          casesHandled: 48,
          successRate: 93,
        },
        {
          category: "소재파악",
          level: "고급" as const,
          casesHandled: 16,
          successRate: 90,
        },
      ],
    },
  ];

  for (const d of detectives) {
    const exists = await repo.findOne({ where: { email: d.email } });
    if (!exists) {
      const saved = await repo.save(repo.create(d));
      console.log(`✅ Created detective: ${d.name}`);

      // Create a linked User account for seeded detective if missing
      try {
        const userRepo = AppDataSource.getRepository(User);
        const existingUser = await userRepo.findOne({
          where: { email: d.email },
        });
        if (!existingUser) {
          const defaultPassword =
            process.env.DETECTIVE_DEFAULT_PASSWORD || "detective123!";
          const hashed = await bcrypt.hash(defaultPassword, 10);
          const newUser = userRepo.create({
            email: d.email,
            password: hashed,
            name: d.name,
            role: "detective",
            isActive: true,
            detectiveId: saved.id,
          });
          await userRepo.save(newUser);
          console.log(
            `   ➕ Created user account for detective ${d.email} (default password)`
          );
        }
      } catch (e) {
        console.warn("Failed to create linked user for detective:", e);
      }
    } else {
      console.log(`⏭️  Detective already exists: ${d.name}`);
    }
  }

  console.log("🌱 Detectives seeded");
}
