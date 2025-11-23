import { Evidence } from "../entities/Evidence";
import logger from "../utils/logger";

// Provider setup
const PROVIDER = (process.env.ANALYSIS_PROVIDER || "mock").toLowerCase();
let azureClient: unknown = null;
let openaiClient: unknown = null;

if (PROVIDER === "azure-openai") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AzureOpenAI } = require("openai");
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    if (endpoint && apiKey) {
      azureClient = new AzureOpenAI({ endpoint, apiKey });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn("Azure OpenAI SDK not available: %s", msg);
  }
} else if (PROVIDER === "openai") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OpenAI } = require("openai");
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL;
    if (apiKey) {
      openaiClient = new OpenAI({ apiKey, baseURL });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn("OpenAI SDK not available: %s", msg);
  }
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
  userPrompt: string
): Promise<string> {
  if (PROVIDER === "azure-openai" && azureClient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (azureClient as any).chat.completions.create({
      model: DEPLOYMENT,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    return response.choices[0]?.message?.content || "";
  } else if (PROVIDER === "openai" && openaiClient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (openaiClient as any).chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    return response.choices[0]?.message?.content || "";
  }
  // Mock fallback
  return `[Mock AI 응답]\n요약: 분석 중입니다.\n핵심: 자동 탐지된 내용.\n다음 단계: 추가 조사 필요.`;
}

export async function analyzeEvidence(evidence: Evidence): Promise<{
  title: string;
  summary: string;
  keyFindings: string[];
  nextSteps: string[];
}> {
  const context = await extractEvidenceContext(evidence);
  const systemPrompt = `당신은 전문 탐정 보조 AI입니다. 증거 자료를 분석하고 핵심 포인트와 다음 조치를 제안합니다.`;
  const userPrompt = `다음 증거를 분석하고 JSON 형식으로 응답하세요:
{
  "title": "증거 분석 보고서 제목",
  "summary": "간략 요약(200자 이내)",
  "keyFindings": ["핵심1", "핵심2", "핵심3"],
  "nextSteps": ["단계1", "단계2", "단계3"]
}

증거 정보:
${context}`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt);
    const parsed = JSON.parse(
      raw
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim()
    );
    return {
      title: parsed.title || `증거 분석 - ${evidence.label}`,
      summary: parsed.summary || "분석 결과",
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error("LLM parse error: %s", msg);
    return {
      title: `증거 분석 - ${evidence.label}`,
      summary: "AI 응답 파싱 실패. 원시 응답을 확인하세요.",
      keyFindings: ["원시 LLM 응답 확인 필요"],
      nextSteps: ["수동 재분석 권장"],
    };
  }
}

export async function analyzeCase(evidences: Evidence[]): Promise<{
  title: string;
  summary: string;
  keyFindings: string[];
  nextSteps: string[];
}> {
  if (evidences.length === 0) {
    return {
      title: "사건 종합 분석",
      summary: "분석할 증거가 없습니다.",
      keyFindings: [],
      nextSteps: [],
    };
  }

  const contexts = await Promise.all(evidences.map(extractEvidenceContext));
  const combined = contexts
    .map((ctx, i) => `=== 증거 ${i + 1} ===\n${ctx}`)
    .join("\n\n");

  const systemPrompt = `당신은 전문 탐정 보조 AI입니다. 여러 증거를 종합 분석하여 사건의 전체 맥락과 다음 단계를 제시합니다.`;
  const userPrompt = `다음 사건의 모든 증거를 종합 분석하고 JSON 형식으로 응답하세요:
{
  "title": "사건 종합 분석 보고서 제목",
  "summary": "전체 사건 요약(500자 이내)",
  "keyFindings": ["종합 핵심1", "종합 핵심2", "종합 핵심3", ...],
  "nextSteps": ["종합 단계1", "종합 단계2", "종합 단계3", ...]
}

증거 목록 (총 ${evidences.length}건):
${combined}`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt);
    const parsed = JSON.parse(
      raw
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim()
    );
    return {
      title: parsed.title || `사건 종합 분석 (${evidences.length}건 증거)`,
      summary: parsed.summary || "종합 분석 결과",
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error("LLM parse error (case): %s", msg);
    return {
      title: `사건 종합 분석 (${evidences.length}건 증거)`,
      summary: "AI 응답 파싱 실패.",
      keyFindings: ["원시 응답 확인 필요"],
      nextSteps: ["수동 재분석 권장"],
    };
  }
}
