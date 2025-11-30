import { Router } from "express";
import { getRepository } from "typeorm";
import multer from "multer";
import { User } from "../entities/User";
import { Case } from "../entities/Case";
import { Report } from "../entities/Report";
import { Evidence } from "../entities/Evidence";
import { SystemSettings } from "../entities/SystemSettings";
import { verifyJWT, requireAdmin, AuthRequest } from "../middleware/auth";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = Router();

// Multer 설정 for file uploads
const upload = multer({
  dest: path.join(process.cwd(), "temp"),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// 모든 admin 라우트에 인증과 admin 권한 필요
router.use(verifyJWT);
router.use(requireAdmin);

// 시스템 설정 조회
router.get("/settings", async (req: AuthRequest, res) => {
  try {
    const settingsRepo = getRepository(SystemSettings);
    let settings = await settingsRepo.findOne({ where: { id: "main" } });

    if (!settings) {
      // 기본 설정 생성
      settings = settingsRepo.create({
        id: "main",
        maintenanceMode: false,
        allowRegistration: true,
        maxFileSize: 10,
        sessionTimeout: 30,
        backupFrequency: "daily",
        emailNotifications: true,
        smsNotifications: false,
        twoFactorAuth: false,
        auditLogging: true,
        updatedAt: new Date(),
        updatedBy: req.user?.userId || "system",
      });
      await settingsRepo.save(settings);
    }

    res.json(settings);
  } catch (error) {
    console.error("Failed to get system settings:", error);
    res.status(500).json({ error: "시스템 설정 조회 실패" });
  }
});

// 시스템 설정 저장
router.put("/settings", async (req: AuthRequest, res) => {
  try {
    const settingsRepo = getRepository(SystemSettings);
    const {
      maintenanceMode,
      allowRegistration,
      maxFileSize,
      sessionTimeout,
      backupFrequency,
      emailNotifications,
      smsNotifications,
      twoFactorAuth,
      auditLogging,
    } = req.body;

    let settings = await settingsRepo.findOne({ where: { id: "main" } });

    if (!settings) {
      settings = settingsRepo.create({ id: "main" });
    }

    // 설정 업데이트
    settings.maintenanceMode = maintenanceMode;
    settings.allowRegistration = allowRegistration;
    settings.maxFileSize = maxFileSize;
    settings.sessionTimeout = sessionTimeout;
    settings.backupFrequency = backupFrequency;
    settings.emailNotifications = emailNotifications;
    settings.smsNotifications = smsNotifications;
    settings.twoFactorAuth = twoFactorAuth;
    settings.auditLogging = auditLogging;
    settings.updatedAt = new Date();
    settings.updatedBy = req.user?.userId || "system";

    await settingsRepo.save(settings);
    res.json(settings);
  } catch (error) {
    console.error("Failed to save system settings:", error);
    res.status(500).json({ error: "시스템 설정 저장 실패" });
  }
});

// 데이터베이스 통계 조회
router.get("/database-stats", async (req: AuthRequest, res) => {
  try {
    const userRepo = getRepository(User);
    const caseRepo = getRepository(Case);
    const reportRepo = getRepository(Report);
    const evidenceRepo = getRepository(Evidence);

    const [totalUsers, totalCases, totalReports, totalEvidence] =
      await Promise.all([
        userRepo.count(),
        caseRepo.count(),
        reportRepo.count(),
        evidenceRepo.count(),
      ]);

    // 데이터베이스 크기 계산 (SQLite의 경우)
    let databaseSize = "알 수 없음";
    try {
      const dbPath = process.env.DATABASE_URL || "database.sqlite";
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        databaseSize = `${(stats.size / (1024 * 1024)).toFixed(2)} MB`;
      }
    } catch (error) {
      console.warn("Failed to get database size:", error);
    }

    // 마지막 백업 시간 (임시로 현재 시간 사용 - 실제 백업 시스템 구현 시 변경)
    const lastBackup = new Date().toISOString();

    // 업타임 계산
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / 86400)}일 ${Math.floor((uptime % 86400) / 3600)}시간 ${Math.floor((uptime % 3600) / 60)}분`;

    res.json({
      totalUsers,
      totalCases,
      totalReports,
      totalEvidence,
      databaseSize,
      lastBackup,
      uptime: uptimeString,
    });
  } catch (error) {
    console.error("Failed to get database stats:", error);
    res.status(500).json({ error: "데이터베이스 통계 조회 실패" });
  }
});

// 관리자 사용자 목록 조회
router.get("/users", async (req: AuthRequest, res) => {
  try {
    const userRepo = getRepository(User);
    const users = await userRepo.find({
      select: ["id", "email", "name", "role", "lastLoginAt", "isActive"],
      where: { role: "admin" },
      order: { lastLoginAt: "DESC" },
    });

    res.json(users);
  } catch (error) {
    console.error("Failed to get admin users:", error);
    res.status(500).json({ error: "관리자 사용자 목록 조회 실패" });
  }
});

// 사용자 상태 변경
router.put("/users/:id/status", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "유효하지 않은 상태 값입니다." });
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    user.isActive = status === "active";
    await userRepo.save(user);

    res.json({ message: "사용자 상태가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error("Failed to change user status:", error);
    res.status(500).json({ error: "사용자 상태 변경 실패" });
  }
});

// 데이터베이스 백업
router.post("/backup", async (req: AuthRequest, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(process.cwd(), "backups");

    // 백업 디렉토리 생성
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `backup-${timestamp}.sql`);

    // SQLite 백업 명령어 실행
    const dbPath = process.env.DATABASE_URL || "database.sqlite";
    const command = `sqlite3 "${dbPath}" .dump > "${backupPath}"`;

    await execAsync(command);

    // 백업 파일 존재 확인
    if (fs.existsSync(backupPath)) {
      res.json({
        message: "데이터베이스 백업이 성공적으로 완료되었습니다.",
        backupPath,
        timestamp,
      });
    } else {
      throw new Error("백업 파일이 생성되지 않았습니다.");
    }
  } catch (error) {
    console.error("Failed to backup database:", error);
    res.status(500).json({ error: "데이터베이스 백업 실패" });
  }
});

// 데이터베이스 복원
router.post(
  "/restore",
  upload.single("backup"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "백업 파일이 제공되지 않았습니다." });
      }

      const backupPath = req.file.path;
      const dbPath = process.env.DATABASE_URL || "database.sqlite";

      // 백업 파일 존재 확인
      if (!fs.existsSync(backupPath)) {
        return res.status(400).json({ error: "백업 파일을 찾을 수 없습니다." });
      }

      // SQLite 복원 명령어 실행
      const command = `sqlite3 "${dbPath}" < "${backupPath}"`;

      await execAsync(command);

      // 임시 파일 삭제
      fs.unlinkSync(backupPath);

      res.json({ message: "데이터베이스 복원이 성공적으로 완료되었습니다." });
    } catch (error) {
      console.error("Failed to restore database:", error);
      res.status(500).json({ error: "데이터베이스 복원 실패" });
    }
  }
);

export default router;
