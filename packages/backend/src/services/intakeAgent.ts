import { AppDataSource } from "../config/database";
import { IntakeSession } from "../entities/IntakeSession";
import { IntakeResponse } from "../entities/IntakeResponse";
import { RequestTemplate } from "../entities/RequestTemplate";
import { Case } from "../entities/Case";
import { DeepPartial } from "typeorm";

// AI provider 재사용
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
let azureClient: unknown;
let openaiClient: unknown;

if (PROVIDER === "azure-openai") {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
  const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
  if (endpoint && apiKey) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { AzureOpenAI } = require("openai");
      azureClient = new AzureOpenAI({ endpoint, apiKey });
    } catch (err) {
      console.error("Failed to load Azure OpenAI SDK:", err);
    }
  }
} else if (PROVIDER === "openai") {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (apiKey) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { OpenAI } = require("openai");
      const config: Record<string, unknown> = { apiKey };
      if (process.env.OPENAI_BASE_URL)
        config.baseURL = process.env.OPENAI_BASE_URL;
      openaiClient = new OpenAI(config);
    } catch (err) {
      console.error("Failed to load OpenAI SDK:", err);
    }
  }
}

const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * LLM 호출 (AI 서비스 재사용)
 */
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
    return `[MOCK AI 응답]\n시스템: ${systemPrompt}\n사용자: ${userPrompt}`;
  }
}

/**
 * 새 접수 세션 시작
 */
export async function startIntakeSession(): Promise<IntakeSession> {
  const repo = AppDataSource.getRepository(IntakeSession);
  const session = repo.create({
    status: "initiated",
    currentStep: 0,
    collectedData: {},
  });
  return await repo.save(session);
}

/**
 * 의뢰 유형 선택 및 템플릿 적용
 */
export async function selectTemplate(
  sessionId: string,
  templateId: string
): Promise<{ session: IntakeSession; initialMessage: string }> {
  const sessionRepo = AppDataSource.getRepository(IntakeSession);
  const templateRepo = AppDataSource.getRepository(RequestTemplate);

  const session = await sessionRepo.findOne({ where: { id: sessionId } });
  if (!session) throw new Error("Session not found");

  const template = await templateRepo.findOne({ where: { id: templateId } });
  if (!template) throw new Error("Template not found");

  session.templateId = templateId;
  session.status = "collecting";
  session.currentStep = 1;
  await sessionRepo.save(session);

  // 첫 메시지 생성
  const firstStep = template.conversationFlow?.[0];
  const initialMessage =
    firstStep?.message ||
    `${template.name} 의뢰를 시작합니다. 필요한 정보를 차례대로 알려주세요.`;

  // AI 응답 기록
  await saveResponse(sessionId, "agent", initialMessage, session.currentStep);

  return { session, initialMessage };
}

/**
 * 클라이언트 메시지 처리 (핵심 로직)
 */
export async function processClientMessage(
  sessionId: string,
  message: string
): Promise<{
  agentMessage: string;
  isComplete: boolean;
  extractedData?: Record<string, unknown>;
}> {
  const sessionRepo = AppDataSource.getRepository(IntakeSession);
  const templateRepo = AppDataSource.getRepository(RequestTemplate);

  const session = await sessionRepo.findOne({
    where: { id: sessionId },
    relations: ["template"],
  });
  if (!session) throw new Error("Session not found");
  if (session.status === "completed" || session.status === "cancelled") {
    return {
      agentMessage: "이미 완료되거나 취소된 세션입니다.",
      isComplete: true,
    };
  }

  // 클라이언트 메시지 저장
  await saveResponse(sessionId, "client", message, session.currentStep);

  const template =
    session.template ||
    (await templateRepo.findOne({ where: { id: session.templateId } }));
  if (!template) {
    return {
      agentMessage: "의뢰 유형을 먼저 선택해주세요.",
      isComplete: false,
    };
  }

  // AI로 정보 추출
  const extractedData = await extractInformation(message, template, session);

  // 수집된 데이터 업데이트
  session.collectedData = { ...session.collectedData, ...extractedData };

  // 완료 여부 확인
  const missingFields = getMissingRequiredFields(
    template,
    session.collectedData
  );

  let agentMessage = "";
  let isComplete = false;

  if (missingFields.length === 0) {
    // 모든 필수 정보 수집 완료
    agentMessage = await generateCompletionMessage(session, template);
    session.status = "completed";
    session.completedAt = new Date();

    // 자동으로 사건 생성
    const caseId = await createCaseFromSession(session, template);
    session.createdCaseId = caseId;
    isComplete = true;

    // ✅ Soft-gating: Intake 완료 후 상담 제안 로직
    try {
      const { proposeConsultationAfterIntake } = await import(
        "./consultationGating"
      );
      const { classifyCase } = await import("./caseAssignment");

      // AI 신뢰도 추출 (classifyCase는 0-100 scale)
      const collectedForClassify = session.collectedData as Record<
        string,
        unknown
      >;
      const classifyResult = await classifyCase({
        title:
          typeof collectedForClassify["title"] === "string"
            ? (collectedForClassify["title"] as string)
            : template.name,
        description: JSON.stringify(collectedForClassify),
      });
      const aiConfidence = classifyResult.confidence / 100; // 0-1 scale로 변환

      // 카테고리
      const category = classifyResult.category || template.name;

      await proposeConsultationAfterIntake(caseId, aiConfidence, category);
    } catch (err) {
      console.error("Failed to propose consultation after intake:", err);
      // 오류 발생해도 Intake 완료는 유지
    }
  } else {
    // 다음 질문 생성
    agentMessage = await generateNextQuestion(missingFields, template, session);
    session.currentStep += 1;
  }

  await sessionRepo.save(session);

  // AI 응답 기록
  await saveResponse(
    sessionId,
    "agent",
    agentMessage,
    session.currentStep,
    extractedData
  );

  return { agentMessage, isComplete, extractedData };
}

/**
 * AI로 사용자 메시지에서 정보 추출
 */
async function extractInformation(
  message: string,
  template: RequestTemplate,
  session: IntakeSession
): Promise<Record<string, unknown>> {
  const fields = template.fields.filter(
    (f) => !(f.key in session.collectedData)
  );

  if (fields.length === 0) return {};

  const systemPrompt = `당신은 탐정사무소의 의뢰 접수 전문가입니다.
의뢰인의 메시지에서 필요한 정보를 추출하세요.

추출할 정보 필드:
${fields.map((f) => `- ${f.key} (${f.label}): ${f.type}${f.required ? " [필수]" : ""}${f.aiPrompt ? ` - ${f.aiPrompt}` : ""}`).join("\n")}

응답은 반드시 JSON 형식으로만 작성하세요:
{
  "필드키": "추출된값",
  ...
}

정보가 명확하지 않으면 해당 필드는 생략하세요.`;

  const userPrompt = `의뢰인 메시지: "${message}"

위 메시지에서 추출 가능한 정보를 JSON으로 반환하세요.`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      // 타입 변환 및 검증
      return validateAndTransform(
        extracted,
        template.fields as TemplateField[]
      );
    }
  } catch (err) {
    console.error("Failed to extract information:", err);
  }

  return {};
}

/**
 * 필드 값 검증 및 타입 변환
 */
type TemplateField = {
  key: string;
  label?: string;
  type?: string;
  required?: boolean;
  aiPrompt?: string;
  placeholder?: string;
};

function validateAndTransform(
  data: Record<string, unknown>,
  fields: TemplateField[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const field = fields.find((f) => f.key === key);
    if (!field || value === undefined || value === null) continue;

    // 기본 타입 변환
    if (field.type === "date" && typeof value === "string") {
      // 날짜 형식 정규화
      result[key] = value;
    } else if (field.type === "phone" && typeof value === "string") {
      // 전화번호 정규화 (숫자만 추출)
      result[key] = value.replace(/[^0-9]/g, "");
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 누락된 필수 필드 확인
 */
function getMissingRequiredFields(
  template: RequestTemplate,
  collectedData: Record<string, unknown>
): TemplateField[] {
  return (template.fields as TemplateField[]).filter(
    (f) => f.required && !collectedData[f.key]
  );
}

/**
 * 다음 질문 생성
 */
async function generateNextQuestion(
  missingFields: TemplateField[],
  template: RequestTemplate,
  session: IntakeSession
): Promise<string> {
  const nextField = missingFields[0];

  // 템플릿 기반 질문
  const conversationFlow = template.conversationFlow || [];
  const currentStep = conversationFlow.find((s) =>
    s.expectedFields.includes(nextField.key)
  );

  if (currentStep?.message) {
    return currentStep.message;
  }

  // AI로 자연스러운 질문 생성
  const systemPrompt = `당신은 친절한 탐정사무소 상담원입니다.
의뢰인에게 필요한 정보를 자연스럽게 질문하세요.
질문은 간결하고 명확하게 1-2문장으로 작성하세요.`;

  const userPrompt = `의뢰 유형: ${template.name}
지금까지 수집한 정보: ${Object.keys(session.collectedData).join(", ") || "없음"}
다음 필요한 정보: ${nextField.label} (${nextField.type})${nextField.placeholder ? ` - 예: ${nextField.placeholder}` : ""}

의뢰인에게 이 정보를 요청하는 질문을 생성하세요.`;

  try {
    const question = await callLLM(systemPrompt, userPrompt);
    return question.trim();
  } catch (err) {
    // Fallback
    return `${nextField.label}을(를) 알려주시겠어요?${nextField.placeholder ? ` (예: ${nextField.placeholder})` : ""}`;
  }
}

/**
 * 완료 메시지 생성
 */
async function generateCompletionMessage(
  session: IntakeSession,
  template: RequestTemplate
): Promise<string> {
  const systemPrompt = `당신은 친절한 탐정사무소 상담원입니다.
의뢰 접수가 완료되었음을 알리고, 다음 절차를 안내하세요.
따뜻하고 전문적인 톤으로 2-3문장으로 작성하세요.`;

  const userPrompt = `의뢰 유형: ${template.name}
수집된 정보: ${JSON.stringify(session.collectedData, null, 2)}

의뢰 접수 완료 메시지를 생성하세요.`;

  try {
    const message = await callLLM(systemPrompt, userPrompt);
    return message.trim();
  } catch (err) {
    return `${template.name} 의뢰 접수가 완료되었습니다. 담당 탐정이 배정되는 대로 연락드리겠습니다. 감사합니다.`;
  }
}

/**
 * 세션으로부터 사건 자동 생성
 */
async function createCaseFromSession(
  session: IntakeSession,
  template: RequestTemplate
): Promise<string> {
  const caseRepo = AppDataSource.getRepository(Case);

  const collected = session.collectedData as Record<string, unknown>;
  const title =
    (typeof collected["title"] === "string"
      ? (collected["title"] as string)
      : undefined) || `${template.name} - ${session.clientName || "의뢰인"}`;

  const description =
    `[자동 접수]\n\n${template.description}\n\n수집된 정보:\n` +
    Object.entries(collected)
      .map(([key, value]) => {
        const field = (template.fields as TemplateField[]).find(
          (f) => f.key === key
        );
        return `- ${field?.label || key}: ${String(value)}`;
      })
      .join("\n");

  const newCase = caseRepo.create({
    title,
    description,
    status: "대기",
  } as DeepPartial<Case>);

  const savedCase = (await caseRepo.save(newCase)) as Case;

  // 자동 배정 활성화된 경우 배정 시도
  if (
    (process.env.AUTO_ASSIGNMENT_ENABLED || "true").toLowerCase() === "true"
  ) {
    try {
      const { autoAssignDetective } = await import("./caseAssignment");
      await autoAssignDetective(savedCase.id).catch((err: unknown) => {
        console.error("Auto-assignment failed:", err);
      });
    } catch (err) {
      console.error("Failed to import auto-assignment:", err);
    }
  }

  return savedCase.id;
}

/**
 * 응답 저장
 */
async function saveResponse(
  sessionId: string,
  sender: "client" | "agent",
  message: string,
  stepNumber?: number,
  extractedData?: Record<string, unknown>
): Promise<void> {
  const repo = AppDataSource.getRepository(IntakeResponse);
  await repo.save(
    repo.create({
      sessionId,
      sender,
      message,
      stepNumber,
      extractedData,
    })
  );
}

/**
 * 활성 템플릿 목록 조회
 */
export async function getActiveTemplates(): Promise<RequestTemplate[]> {
  const repo = AppDataSource.getRepository(RequestTemplate);
  return await repo.find({
    where: { isActive: true },
    order: { sortOrder: "ASC", name: "ASC" },
  });
}

/**
 * 세션 조회 (대화 기록 포함)
 */
export async function getSessionWithHistory(sessionId: string): Promise<{
  session: IntakeSession;
  messages: IntakeResponse[];
}> {
  const sessionRepo = AppDataSource.getRepository(IntakeSession);
  const responseRepo = AppDataSource.getRepository(IntakeResponse);

  const session = await sessionRepo.findOne({
    where: { id: sessionId },
    relations: ["template"],
  });
  if (!session) throw new Error("Session not found");

  const messages = await responseRepo.find({
    where: { sessionId },
    order: { createdAt: "ASC" },
  });

  return { session, messages };
}

/**
 * 세션 취소
 */
export async function cancelSession(sessionId: string): Promise<void> {
  const repo = AppDataSource.getRepository(IntakeSession);
  const session = await repo.findOne({ where: { id: sessionId } });
  if (session) {
    session.status = "cancelled";
    await repo.save(session);
  }
}
