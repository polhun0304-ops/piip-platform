import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

/**
 * 기본 관리자 계정 생성
 * 이미 관리자 계정이 존재하면 스킵
 */
export async function seedAdminUser() {
  const userRepository = AppDataSource.getRepository(User);

  try {
    // 기존 관리자 계정 확인
    const existingAdmin = await userRepository.findOne({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      console.log("✅ 관리자 계정이 이미 존재합니다.");
      return;
    }

    // 환경 변수에서 관리자 정보 가져오기 (없으면 기본값 사용)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@piip.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123!@#";

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 관리자 계정 생성
    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    await userRepository.save(admin);

    console.log("✅ 기본 관리자 계정이 생성되었습니다.");
    console.log(`   이메일: ${adminEmail}`);
    console.log(`   비밀번호: ${adminPassword}`);
    console.log("   ⚠️ 보안을 위해 초기 비밀번호를 변경하세요!");
  } catch (error) {
    console.error("❌ 관리자 계정 생성 실패:", error);
    throw error;
  }
}
