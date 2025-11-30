import { DataSource } from "typeorm";
import { Case } from "../entities/Case";
import { Evidence } from "../entities/Evidence";
import { AnalysisJob } from "../entities/AnalysisJob";
import { AnalysisArtifact } from "../entities/AnalysisArtifact";
import { RequestTemplate } from "../entities/RequestTemplate";
import { IntakeSession } from "../entities/IntakeSession";
import { IntakeResponse } from "../entities/IntakeResponse";
import { Detective } from "../entities/Detective";
import { CaseAssignment } from "../entities/CaseAssignment";
import { User } from "../entities/User";
import { PricingTemplate } from "../entities/PricingTemplate";
import { Quote } from "../entities/Quote";
import { Consultation } from "../entities/Consultation";
import E2EKey from "../entities/E2EKey";
import { SystemSettings } from "../entities/SystemSettings";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "piip.db",
  synchronize: true, // 개발 환경에서만 true, 프로덕션에서는 migration 사용
  logging: true,
  entities: [
    Case,
    Evidence,
    AnalysisJob,
    AnalysisArtifact,
    RequestTemplate,
    IntakeSession,
    IntakeResponse,
    Detective,
    CaseAssignment,
    User,
    E2EKey,
    PricingTemplate,
    Quote,
    Consultation,
    Report,
    SystemSettings,
  ],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database initialized successfully");

    // Seed admin user
    const { seedAdminUser } = await import("../services/seedAdmin");
    await seedAdminUser();

    // Seed request templates on first run
    const { seedRequestTemplates } = await import("../services/seedTemplates");
    await seedRequestTemplates();

    // Seed sample detectives
    const { seedDetectives } = await import("../services/seedDetectives");
    await seedDetectives();
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
    throw error;
  }
};
