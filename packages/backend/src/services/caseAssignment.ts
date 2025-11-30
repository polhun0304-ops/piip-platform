import { AppDataSource } from "../config/database";
import { Case } from "../entities/Case";
import { Detective } from "../entities/Detective";
import { CaseAssignment } from "../entities/CaseAssignment";
import { RequestTemplate } from "../entities/RequestTemplate";

// AI provider 재사용 with enhanced configuration
const PROVIDER = (process.env.ANALYSIS_PROVIDER || "mock").toLowerCase();
type LLMClientShape = {
  chat?: {
    completions?: {
      create: (
        opts: Record<string, unknown>
      ) => Promise<Record<string, unknown>>;
    };
  };
};
let azureClient: LLMClientShape | null = null;
let openaiClient: LLMClientShape | null = null;

if (PROVIDER === "azure-openai") {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
  const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
  const apiVersion = process.env.OPENAI_API_VERSION || "2024-02-15-preview";
  if (
    endpoint &&
    apiKey &&
    endpoint !== "https://your-resource.openai.azure.com"
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { AzureOpenAI } = require("openai");
      azureClient = new AzureOpenAI({ endpoint, apiKey, apiVersion });
      console.log("CaseAssignment: Azure OpenAI client initialized");
    } catch (err) {
      console.error("CaseAssignment: Failed to load Azure OpenAI SDK:", err);
      azureClient = null;
    }
  } else {
    console.warn(
      "CaseAssignment: Azure OpenAI credentials not properly configured"
    );
  }
} else if (PROVIDER === "openai") {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (apiKey && apiKey !== "your-api-key-here") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { OpenAI } = require("openai");
      const config: Record<string, unknown> = { apiKey };
      if (process.env.OPENAI_BASE_URL)
        (config as Record<string, unknown>).baseURL =
          process.env.OPENAI_BASE_URL;
      openaiClient = new OpenAI(config);
      console.log("CaseAssignment: OpenAI client initialized");
    } catch (err) {
      console.error("CaseAssignment: Failed to load OpenAI SDK:", err);
      openaiClient = null;
    }
  } else {
    console.warn("CaseAssignment: OpenAI API key not properly configured");
  }
}

const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

async function callLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];

  if (PROVIDER === "azure-openai" && azureClient) {
    const client = azureClient as LLMClientShape;
    const response = (await client.chat!.completions!.create({
      model: DEPLOYMENT,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    })) as Record<string, unknown>;
    const choices = response.choices as unknown as Array<{
      message?: { content?: string };
    }>;
    return choices?.[0]?.message?.content || "";
  } else if (PROVIDER === "openai" && openaiClient) {
    const client = openaiClient as LLMClientShape;
    const response = (await client.chat!.completions!.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    })) as Record<string, unknown>;
    const choices = response.choices as unknown as Array<{
      message?: { content?: string };
    }>;
    return choices?.[0]?.message?.content || "";
  } else {
    // Mock mode
    return `[MOCK AI]\n${userPrompt}`;
  }
}

/**
 * 사건 카테고리 자동 분류
 */
export async function classifyCase(caseData: {
  title: string;
  description: string;
}): Promise<{ category: string; confidence: number }> {
  const templateRepo = AppDataSource.getRepository(RequestTemplate);
  const templates = await templateRepo.find({ where: { isActive: true } });

  const categories = templates.map((t) => t.name).join(", ");

  const systemPrompt = `당신은 탐정사무소의 사건 분류 전문가입니다.
의뢰 내용을 분석하여 가장 적합한 카테고리를 선택하세요.

사용 가능한 카테고리: ${categories}

응답은 JSON 형식으로만 작성하세요:
{
  "category": "선택된 카테고리",
  "confidence": 95
}

confidence는 0-100 사이의 숫자로, 분류의 확신도를 나타냅니다.`;

  const userPrompt = `사건 제목: ${caseData.title}
사건 설명: ${caseData.description}

위 사건을 가장 적합한 카테고리로 분류하세요.`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        category: result.category || "기타",
        confidence: result.confidence || 50,
      };
    }
  } catch (err) {
    console.error("Failed to classify case:", err);
  }

  // Fallback: 키워드 기반 간단 분류
  const keywords = {
    불륜조사: ["불륜", "외도", "바람", "배우자", "연인"],
    소재파악: ["찾기", "소재", "위치", "연락", "행방"],
    신원조사: ["신원", "신용", "경력", "학력", "결혼"],
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (
      words.some(
        (w) => caseData.title.includes(w) || caseData.description.includes(w)
      )
    ) {
      return { category, confidence: 60 };
    }
  }

  return { category: "기타", confidence: 30 };
}

/**
 * AI 기반 탐정 매칭 점수 계산
 */
export async function calculateMatchScore(
  caseData: Case,
  detective: Detective,
  category: string
): Promise<{
  score: number;
  reason: {
    specialtyMatch: boolean;
    experienceMatch: boolean;
    availabilityMatch: boolean;
    performanceMatch: boolean;
    details: string;
  };
}> {
  let score = 0;
  const reasons: string[] = [];

  // 1. 전문 분야 매칭 (40점)
  const specialty = detective.specialties.find((s) => s.category === category);
  let specialtyMatch = false;
  if (specialty) {
    specialtyMatch = true;
    const levelScores = { 초급: 20, 중급: 30, 고급: 35, 전문가: 40 };
    score += levelScores[specialty.level] || 20;
    reasons.push(
      `${category} 분야 ${specialty.level} (${specialty.casesHandled}건 경험)`
    );
  } else {
    reasons.push(`${category} 분야 경험 없음`);
  }

  // 2. 전체 경력 (20점)
  let experienceMatch = false;
  if (detective.experienceYears >= 5) {
    score += 20;
    experienceMatch = true;
    reasons.push(`경력 ${detective.experienceYears}년`);
  } else if (detective.experienceYears >= 2) {
    score += 15;
    experienceMatch = true;
    reasons.push(`경력 ${detective.experienceYears}년`);
  } else {
    score += 10;
    reasons.push(`경력 ${detective.experienceYears}년 (초보)`);
  }

  // 3. 가용성 (20점)
  let availabilityMatch = false;
  const utilization = detective.currentCaseCount / detective.maxConcurrentCases;
  if (utilization < 0.5) {
    score += 20;
    availabilityMatch = true;
    reasons.push(
      `여유 있음 (${detective.currentCaseCount}/${detective.maxConcurrentCases})`
    );
  } else if (utilization < 0.8) {
    score += 15;
    availabilityMatch = true;
    reasons.push(
      `보통 (${detective.currentCaseCount}/${detective.maxConcurrentCases})`
    );
  } else if (utilization < 1.0) {
    score += 10;
    reasons.push(
      `바쁨 (${detective.currentCaseCount}/${detective.maxConcurrentCases})`
    );
  } else {
    score += 0;
    reasons.push(
      `포화 (${detective.currentCaseCount}/${detective.maxConcurrentCases})`
    );
  }

  // 4. 성과 (20점)
  let performanceMatch = false;
  if (detective.successRate >= 90 && detective.averageRating >= 4.5) {
    score += 20;
    performanceMatch = true;
    reasons.push(
      `우수 성과 (성공률 ${detective.successRate}%, 평점 ${detective.averageRating})`
    );
  } else if (detective.successRate >= 75 && detective.averageRating >= 4.0) {
    score += 15;
    performanceMatch = true;
    reasons.push(
      `양호 성과 (성공률 ${detective.successRate}%, 평점 ${detective.averageRating})`
    );
  } else {
    score += 10;
    reasons.push(
      `보통 성과 (성공률 ${detective.successRate}%, 평점 ${detective.averageRating})`
    );
  }

  // 상태 체크
  if (detective.status !== "활동중") {
    score = score * 0.5; // 휴식중이면 점수 50% 감소
    reasons.push(`[경고] 현재 ${detective.status} 상태`);
  }

  return {
    score: Math.min(100, Math.round(score)),
    reason: {
      specialtyMatch,
      experienceMatch,
      availabilityMatch,
      performanceMatch,
      details: reasons.join(" | "),
    },
  };
}

/**
 * 최적 탐정 자동 배정
 */
export async function autoAssignDetective(
  caseId: string,
  options: {
    minScore?: number; // 최소 매칭 점수 (기본 50)
    maxCandidates?: number; // 최대 후보 수 (기본 5)
  } = {}
): Promise<CaseAssignment | null> {
  const { minScore = 50 } = options;

  const caseRepo = AppDataSource.getRepository(Case);
  const detectiveRepo = AppDataSource.getRepository(Detective);
  const assignmentRepo = AppDataSource.getRepository(CaseAssignment);

  const caseData = await caseRepo.findOne({ where: { id: caseId } });
  if (!caseData) throw new Error("Case not found");

  // 사건 카테고리 분류
  const { category } = await classifyCase({
    title: caseData.title,
    description: caseData.description || "",
  });

  console.log(`📋 Case ${caseId} classified as: ${category}`);

  // 활동 중인 탐정 목록 조회
  const detectives = await detectiveRepo.find({
    where: { status: "활동중" },
  });

  if (detectives.length === 0) {
    console.log("⚠️  No active detectives available");
    // 배정 대기 상태로 생성
    const pending = assignmentRepo.create({
      caseId,
      status: "pending",
      assignmentType: "auto",
      notes: `카테고리: ${category} - 활동 중인 탐정 없음`,
    });
    return await assignmentRepo.save(pending);
  }

  // 각 탐정별 매칭 점수 계산
  const candidates = await Promise.all(
    detectives.map(async (detective) => {
      const { score, reason } = await calculateMatchScore(
        caseData,
        detective,
        category
      );
      return { detective, score, reason };
    })
  );

  // 점수 순으로 정렬
  candidates.sort((a, b) => b.score - a.score);

  // 최소 점수 이상인 후보 필터링
  const qualified = candidates.filter((c) => c.score >= minScore);

  if (qualified.length === 0) {
    console.log(`⚠️  No qualified detectives (min score: ${minScore})`);
    // 가장 높은 점수의 탐정에게라도 배정 시도
    const best = candidates[0];
    if (best) {
      const assignment = assignmentRepo.create({
        caseId,
        detectiveId: best.detective.id,
        status: "assigned",
        assignmentType: "auto",
        matchScore: best.score,
        matchReason: best.reason,
        notes: `카테고리: ${category} - 최적 매칭 점수 미달이나 최선의 선택`,
        assignedAt: new Date(),
      });

      const saved = await assignmentRepo.save(assignment);

      // 탐정 현재 사건 수 증가
      best.detective.currentCaseCount += 1;
      await detectiveRepo.save(best.detective);

      // 사건 상태 업데이트
      caseData.status = "조사 중";
      await caseRepo.save(caseData);

      console.log(
        `✅ Assigned to ${best.detective.name} (score: ${best.score})`
      );
      return saved;
    }
    return null;
  }

  // 최고 점수 탐정에게 배정
  const best = qualified[0];
  const assignment = assignmentRepo.create({
    caseId,
    detectiveId: best.detective.id,
    status: "assigned",
    assignmentType: "auto",
    matchScore: best.score,
    matchReason: best.reason,
    notes: `카테고리: ${category}`,
    assignedAt: new Date(),
  });

  const saved = await assignmentRepo.save(assignment);

  // 탐정 현재 사건 수 증가
  best.detective.currentCaseCount += 1;
  await detectiveRepo.save(best.detective);

  // 사건 상태 업데이트
  caseData.status = "조사 중";
  await caseRepo.save(caseData);

  console.log(`✅ Assigned to ${best.detective.name} (score: ${best.score})`);
  return saved;
}

/**
 * 탐정 선택 가능한 사건 목록 조회
 */
export async function getAvailableCasesForSelection(): Promise<
  Array<{
    case: Case;
    category: string;
    suggestedDetectives: Array<{
      detective: Detective;
      score: number;
      reason: unknown;
    }>;
  }>
> {
  const caseRepo = AppDataSource.getRepository(Case);
  const detectiveRepo = AppDataSource.getRepository(Detective);
  const assignmentRepo = AppDataSource.getRepository(CaseAssignment);

  // 배정되지 않은 사건 조회
  const allCases = await caseRepo.find({ where: { status: "대기" } });

  const results = [];

  for (const caseData of allCases) {
    // 이미 배정된 사건은 제외
    const existing = await assignmentRepo.findOne({
      where: { caseId: caseData.id, status: "assigned" },
    });
    if (existing) continue;

    // 카테고리 분류
    const { category } = await classifyCase({
      title: caseData.title,
      description: caseData.description || "",
    });

    // 활동 중인 탐정 목록
    const detectives = await detectiveRepo.find({
      where: { status: "활동중" },
    });

    // 매칭 점수 계산
    const candidates = await Promise.all(
      detectives.map(async (detective) => {
        const { score, reason } = await calculateMatchScore(
          caseData,
          detective,
          category
        );
        return { detective, score, reason };
      })
    );

    // 상위 3명만 추천
    candidates.sort((a, b) => b.score - a.score);
    const topCandidates = candidates.slice(0, 3);

    results.push({
      case: caseData,
      category,
      suggestedDetectives: topCandidates,
    });
  }

  return results;
}

/**
 * 수동 배정
 */
export async function manualAssignDetective(
  caseId: string,
  detectiveId: string,
  notes?: string
): Promise<CaseAssignment> {
  const caseRepo = AppDataSource.getRepository(Case);
  const detectiveRepo = AppDataSource.getRepository(Detective);
  const assignmentRepo = AppDataSource.getRepository(CaseAssignment);

  const caseData = await caseRepo.findOne({ where: { id: caseId } });
  if (!caseData) throw new Error("Case not found");

  const detective = await detectiveRepo.findOne({ where: { id: detectiveId } });
  if (!detective) throw new Error("Detective not found");

  // 기존 배정 취소
  await assignmentRepo.update(
    { caseId, status: "assigned" },
    { status: "reassigned" }
  );

  // 카테고리 분류
  const { category } = await classifyCase({
    title: caseData.title,
    description: caseData.description || "",
  });

  // 매칭 점수 계산
  const { score, reason } = await calculateMatchScore(
    caseData,
    detective,
    category
  );

  // 새 배정 생성
  const assignment = assignmentRepo.create({
    caseId,
    detectiveId,
    status: "assigned",
    assignmentType: "manual",
    matchScore: score,
    matchReason: reason,
    notes: notes || `수동 배정 - 카테고리: ${category}`,
    assignedAt: new Date(),
  });

  const saved = await assignmentRepo.save(assignment);

  // 탐정 현재 사건 수 증가
  detective.currentCaseCount += 1;
  await detectiveRepo.save(detective);

  // 사건 상태 업데이트
  caseData.status = "조사 중";
  await caseRepo.save(caseData);

  console.log(`✅ Manually assigned to ${detective.name}`);
  return saved;
}

/**
 * 탐정의 배정 수락
 */
export async function acceptAssignment(assignmentId: string): Promise<void> {
  const repo = AppDataSource.getRepository(CaseAssignment);
  const assignment = await repo.findOne({ where: { id: assignmentId } });
  if (!assignment) throw new Error("Assignment not found");

  assignment.status = "accepted";
  assignment.respondedAt = new Date();
  await repo.save(assignment);

  console.log(`✅ Assignment ${assignmentId} accepted`);
}

/**
 * 탐정의 배정 거절 및 재배정
 */
export async function rejectAssignment(
  assignmentId: string,
  reason: string
): Promise<CaseAssignment | null> {
  const assignmentRepo = AppDataSource.getRepository(CaseAssignment);
  const detectiveRepo = AppDataSource.getRepository(Detective);

  const assignment = await assignmentRepo.findOne({
    where: { id: assignmentId },
    relations: ["detective"],
  });
  if (!assignment) throw new Error("Assignment not found");

  // 거절 기록
  assignment.status = "rejected";
  assignment.rejectionReason = reason;
  assignment.respondedAt = new Date();
  await assignmentRepo.save(assignment);

  // 탐정 사건 수 감소
  if (assignment.detective) {
    assignment.detective.currentCaseCount = Math.max(
      0,
      assignment.detective.currentCaseCount - 1
    );
    await detectiveRepo.save(assignment.detective);
  }

  console.log(`❌ Assignment ${assignmentId} rejected: ${reason}`);

  // 자동 재배정 시도
  return await autoAssignDetective(assignment.caseId, {
    minScore: 40, // 재배정 시 기준 완화
  });
}
