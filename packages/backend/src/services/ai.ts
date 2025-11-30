import { Evidence } from "../entities/Evidence";
import logger from "../utils/logger";

// Enhanced client types
interface LLMClient {
  chat: {
    completions: {
      create: (options: {
        model: string;
        messages: Array<{ role: string; content: string }>;
        temperature?: number;
        max_tokens?: number;
      }) => Promise<{
        choices: Array<{
          message?: { content?: string };
        }>;
      }>;
    };
  };
}

// Provider setup with enhanced error handling and fallback support
const PRIMARY_PROVIDER = (
  process.env.ANALYSIS_PROVIDER || "mock"
).toLowerCase();

// Initialize both clients for fallback support
let azureClient: LLMClient | null = null;
let openaiClient: LLMClient | null = null;

// Initialize Azure OpenAI client (primary)
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.OPENAI_API_VERSION || "2024-02-15-preview";

if (
  azureEndpoint &&
  azureApiKey &&
  azureEndpoint !== "https://your-resource.openai.azure.com" &&
  azureApiKey !== "your-actual-azure-api-key"
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AzureOpenAI } = require("openai");
    azureClient = new AzureOpenAI({
      endpoint: azureEndpoint,
      apiKey: azureApiKey,
      apiVersion,
      dangerouslyAllowBrowser: false, // Server-side only
    }) as LLMClient;
    logger.info("Azure OpenAI client initialized successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("Failed to initialize Azure OpenAI client: %s", msg);
    azureClient = null;
  }
} else {
  logger.warn(
    "Azure OpenAI credentials not configured, will use as fallback if available"
  );
}

// Initialize OpenAI client (fallback)
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiBaseURL = process.env.OPENAI_BASE_URL;

if (
  openaiApiKey &&
  openaiApiKey !== "your-actual-openai-key" &&
  openaiApiKey !== "your-api-key-here"
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OpenAI } = require("openai");
    openaiClient = new OpenAI({
      apiKey: openaiApiKey,
      baseURL: openaiBaseURL,
      dangerouslyAllowBrowser: false, // Server-side only
    }) as LLMClient;
    logger.info("OpenAI client initialized successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("Failed to initialize OpenAI client: %s", msg);
    openaiClient = null;
  }
} else {
  logger.warn(
    "OpenAI credentials not configured, will use as fallback if available"
  );
}

const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Media type plugins (stubs for now, can be expanded with Azure services)
async function extractTextFromDocument(filePath: string): Promise<string> {
  // TODO: Azure Document Intelligence OCR
  return `[문서 추출 텍스트 플레이스홀더: ${filePath}]`;
}

async function transcribeAudio(filePath: string): Promise<string> {
  // TODO: Azure Speech to Text
  return `[음성 전사 플레이스홀더: ${filePath}]`;
}

async function summarizeVideo(filePath: string): Promise<string> {
  // TODO: Azure Video Indexer or frame extraction + captioning
  return `[비디오 요약 플레이스홀더: ${filePath}]`;
}

async function describeImage(filePath: string): Promise<string> {
  // TODO: Azure Computer Vision (Image Analysis)
  return `[이미지 설명 플레이스홀더: ${filePath}]`;
}

async function extractEvidenceContext(evidence: Evidence): Promise<string> {
  let context = `증거명: ${evidence.label}\n증거 유형: ${evidence.type}\n업로드 날짜: ${evidence.date || evidence.createdAt}\n`;
  if (!evidence.filePath) return context + "\n[파일 경로 없음]";

  try {
    switch (evidence.type) {
      case "문서":
        context += await extractTextFromDocument(evidence.filePath);
        break;
      case "오디오":
        context += await transcribeAudio(evidence.filePath);
        break;
      case "비디오":
        context += await summarizeVideo(evidence.filePath);
        break;
      case "이미지":
        context += await describeImage(evidence.filePath);
        break;
      default:
        context += "[알 수 없는 증거 유형]";
    }
  } catch (e) {
    context += `[플러그인 오류: ${(e as Error).message}]`;
  }
  return context;
}

async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    retries?: number;
  } = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 2000, retries = 2 } = options;

  // Validate inputs
  if (!systemPrompt?.trim() || !userPrompt?.trim()) {
    throw new Error("System prompt and user prompt are required");
  }

  const messages = [
    { role: "system", content: systemPrompt.trim() },
    { role: "user", content: userPrompt.trim() },
  ];

  // If both clients are null, use mock mode
  if (!azureClient && !openaiClient) {
    logger.warn("No AI clients available, using mock response");
    return generateMockResponse(systemPrompt, userPrompt);
  }

  // Try Azure OpenAI first (primary)
  if (azureClient) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logger.info(
          "Attempting Azure OpenAI call with model: %s (attempt %d)",
          DEPLOYMENT,
          attempt + 1
        );
        const response = await azureClient.chat.completions.create({
          model: DEPLOYMENT,
          messages,
          temperature,
          max_tokens: maxTokens,
        });
        const content = response.choices[0]?.message?.content;
        if (content) {
          logger.info("Azure OpenAI call successful");
          return content.trim();
        }
      } catch (err: unknown) {
        const error = err as Error;
        const isRetryable =
          error.message.includes("rate limit") ||
          error.message.includes("timeout") ||
          error.message.includes("network") ||
          error.message.includes("ECONNRESET");

        logger.warn(
          `Azure OpenAI attempt ${attempt + 1} failed: ${error.message}`
        );

        if (!isRetryable || attempt === retries) {
          // If not retryable or max retries reached, break and try OpenAI fallback
          if (openaiClient) {
            logger.info("Azure OpenAI failed, falling back to OpenAI direct");
          }
          break;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Try OpenAI direct as fallback
  if (openaiClient) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logger.info(
          "Attempting OpenAI direct call with model: %s (attempt %d)",
          MODEL,
          attempt + 1
        );
        const response = await openaiClient.chat.completions.create({
          model: MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
        });
        const content = response.choices[0]?.message?.content;
        if (content) {
          logger.info("OpenAI direct call successful");
          return content.trim();
        }
      } catch (err: unknown) {
        const error = err as Error;
        const isRetryable =
          error.message.includes("rate limit") ||
          error.message.includes("timeout") ||
          error.message.includes("network") ||
          error.message.includes("ECONNRESET");

        logger.warn(
          `OpenAI direct attempt ${attempt + 1} failed: ${error.message}`
        );

        if (!isRetryable || attempt === retries) {
          logger.error(
            `OpenAI direct call failed after ${retries + 1} attempts: ${error.message}`
          );
          break;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If we reach here, all clients failed, use mock response
  logger.warn("All AI clients failed, using mock response");
  return generateMockResponse(systemPrompt, userPrompt);
}

// Generate intelligent mock responses based on prompt content
function generateMockResponse(
  systemPrompt: string,
  userPrompt: string
): string {
  const lowerPrompt = (systemPrompt + " " + userPrompt).toLowerCase();

  if (lowerPrompt.includes("증거") && lowerPrompt.includes("분석")) {
    return `{
  "title": "증거 분석 보고서",
  "summary": "제공된 증거를 분석한 결과, 관련성이 높은 정보를 발견했습니다.",
  "keyFindings": [
    "증거의 신뢰성이 확인되었습니다",
    "추가 조사가 필요한 부분이 식별되었습니다",
    "관련 법규 준수 여부를 검토했습니다"
  ],
  "nextSteps": [
    "추가 증거 수집",
    "관련자 면담 진행",
    "법적 검토 실시"
  ]
}`;
  }

  if (lowerPrompt.includes("사건") && lowerPrompt.includes("종합")) {
    return `{
  "title": "사건 종합 분석 보고서",
  "summary": "여러 증거를 종합 분석한 결과, 사건의 전체적인 맥락이 파악되었습니다.",
  "keyFindings": [
    "사건의 주요 패턴이 식별되었습니다",
    "증거 간 연관성이 확인되었습니다",
    "위험 요소가 평가되었습니다"
  ],
  "nextSteps": [
    "심층 조사 계획 수립",
    "전문가 자문 요청",
    "보고서 작성 및 검토"
  ]
}`;
  }

  // Default mock response
  return `[AI 모의 응답 - ${PRIMARY_PROVIDER} 설정 필요]
시스템 프롬프트: ${systemPrompt.substring(0, 100)}...
사용자 프롬프트: ${userPrompt.substring(0, 100)}...

실제 AI 분석을 위해서는 환경 변수를 올바르게 설정해주세요:
- ANALYSIS_PROVIDER: azure-openai 또는 openai
- AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY (Azure의 경우)
- OPENAI_API_KEY (OpenAI의 경우)`;
}

export async function analyzeEvidence(evidence: Evidence): Promise<{
  title: string;
  summary: string;
  keyFindings: string[];
  nextSteps: string[];
  confidence: number;
  processingTime: number;
}> {
  const startTime = Date.now();

  try {
    const context = await extractEvidenceContext(evidence);
    const systemPrompt = `당신은 전문 탐정 보조 AI입니다. 증거 자료를 분석하고 핵심 포인트와 다음 조치를 제안합니다.
응답은 반드시 유효한 JSON 형식으로만 작성하세요.`;

    const userPrompt = `다음 증거를 분석하고 JSON 형식으로 응답하세요:
{
  "title": "증거 분석 보고서 제목",
  "summary": "간략 요약(200자 이내)",
  "keyFindings": ["핵심1", "핵심2", "핵심3"],
  "nextSteps": ["단계1", "단계2", "단계3"],
  "confidence": 85
}

증거 정보:
${context}`;

    const raw = await callLLM(systemPrompt, userPrompt, {
      temperature: 0.3, // Lower temperature for more consistent analysis
      maxTokens: 1500,
    });

    const parsed = parseJsonResponse(raw);
    const processingTime = Date.now() - startTime;

    return {
      title: parsed.title || `증거 분석 - ${evidence.label}`,
      summary: parsed.summary || "분석 결과",
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 50,
      processingTime,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error("Evidence analysis failed: %s", msg);

    return {
      title: `증거 분석 - ${evidence.label}`,
      summary: `분석 실패: ${msg}`,
      keyFindings: ["분석 중 오류 발생"],
      nextSteps: ["수동 재분석 권장"],
      confidence: 0,
      processingTime: Date.now() - startTime,
    };
  }
}

export async function analyzeCase(evidences: Evidence[]): Promise<{
  title: string;
  summary: string;
  keyFindings: string[];
  nextSteps: string[];
  confidence: number;
  processingTime: number;
  evidenceCount: number;
}> {
  const startTime = Date.now();

  try {
    if (evidences.length === 0) {
      return {
        title: "사건 종합 분석",
        summary: "분석할 증거가 없습니다.",
        keyFindings: [],
        nextSteps: [],
        confidence: 0,
        processingTime: 0,
        evidenceCount: 0,
      };
    }

    const contexts = await Promise.all(evidences.map(extractEvidenceContext));
    const combined = contexts
      .map((ctx, i) => `=== 증거 ${i + 1}: ${evidences[i].label} ===\n${ctx}`)
      .join("\n\n");

    const systemPrompt = `당신은 전문 탐정 보조 AI입니다. 여러 증거를 종합 분석하여 사건의 전체 맥락과 다음 단계를 제시합니다.
응답은 반드시 유효한 JSON 형식으로만 작성하세요.`;

    const userPrompt = `다음 사건의 모든 증거를 종합 분석하고 JSON 형식으로 응답하세요:
{
  "title": "사건 종합 분석 보고서 제목",
  "summary": "전체 사건 요약(500자 이내)",
  "keyFindings": ["종합 핵심1", "종합 핵심2", "종합 핵심3"],
  "nextSteps": ["종합 단계1", "종합 단계2", "종합 단계3"],
  "confidence": 90
}

증거 목록 (총 ${evidences.length}건):
${combined}`;

    const raw = await callLLM(systemPrompt, userPrompt, {
      temperature: 0.2, // Even lower temperature for case analysis
      maxTokens: 2500,
    });

    const parsed = parseJsonResponse(raw);
    const processingTime = Date.now() - startTime;

    return {
      title: parsed.title || `사건 종합 분석 (${evidences.length}건 증거)`,
      summary: parsed.summary || "종합 분석 결과",
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 60,
      processingTime,
      evidenceCount: evidences.length,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error("Case analysis failed: %s", msg);

    return {
      title: `사건 종합 분석 (${evidences.length}건 증거)`,
      summary: `분석 실패: ${msg}`,
      keyFindings: ["종합 분석 중 오류 발생"],
      nextSteps: ["수동 재분석 권장"],
      confidence: 0,
      processingTime: Date.now() - startTime,
      evidenceCount: evidences.length,
    };
  }
}

// Enhanced JSON parsing with better error handling
function parseJsonResponse(raw: string): any {
  try {
    // Remove markdown code blocks if present
    let cleaned = raw
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .trim();

    // Find JSON object boundaries
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || start >= end) {
      throw new Error("No valid JSON object found in response");
    }

    cleaned = cleaned.substring(start, end + 1);

    // Parse JSON
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Parsed result is not a valid object");
    }

    return parsed;
  } catch (e) {
    const error = e as Error;
    logger.warn(
      "JSON parsing failed: %s. Raw response: %s",
      error.message,
      raw.substring(0, 200)
    );

    // Return a basic structure as fallback
    return {
      title: "분석 결과",
      summary: "JSON 파싱 실패로 인한 기본 응답",
      keyFindings: ["원시 응답 확인 필요"],
      nextSteps: ["수동 재분석 권장"],
      confidence: 10,
    };
  }
}
