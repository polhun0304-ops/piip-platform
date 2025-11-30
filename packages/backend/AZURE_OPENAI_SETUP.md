# Azure OpenAI 설정 가이드

## 환경 변수 구성

`.env` 파일에 다음 설정을 추가하세요:

### 1. Azure OpenAI 사용 (권장)

```env
# AI 분석 활성화
ANALYSIS_ENABLED=true
ANALYSIS_CREATE_EVIDENCE=true

# Azure OpenAI 설정
ANALYSIS_PROVIDER=azure-openai
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

# 또는 gpt-4o, gpt-4 등 사용 가능
```

### 2. OpenAI 직접 사용

```env
ANALYSIS_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1  # 선택사항
```

### 3. Mock 모드 (개발/테스트)

```env
ANALYSIS_PROVIDER=mock
```

## 주요 기능

### 증거 단위 분석 (Per-Evidence Analysis)

증거 업로드 시 자동으로 실행:

- 개별 증거 파일 AI 심층 분석
- 편집 가능한 Markdown 파일 생성 (탐정용)
- 수정 불가능한 PDF 보고서 생성 (의뢰인용)

### 사건 단위 종합 분석 (Case-Aggregate Analysis)

증거가 사건에 연결된 경우 자동 실행:

- 사건 내 모든 증거를 종합 분석
- 증거 간 연관성 및 전체 맥락 파악
- 종합 분석 초안(MD) + 종합 보고서(PDF) 생성
- 새 증거 추가 시 자동 재분석

## 미디어 타입별 플러그인

현재 구현된 플러그인 (향후 Azure 서비스 연동 예정):

### 문서 (`extractTextFromDocument`)

- **현재**: 기본 텍스트 추출 스텁
- **계획**: Azure Document Intelligence 연동

### 오디오 (`transcribeAudio`)

- **현재**: 기본 설명 스텁
- **계획**: Azure Speech to Text 연동

### 비디오 (`summarizeVideo`)

- **현재**: 기본 요약 스텁
- **계획**: Azure Video Indexer 연동

### 이미지 (`describeImage`)

- **현재**: 기본 설명 스텁
- **계획**: Azure Computer Vision 연동

## API 엔드포인트

모든 엔드포인트는 JWT 인증 필요 (`Authorization: Bearer <token>`):

### 분석 작업 조회

```bash
# 모든 작업
GET /api/analysis/jobs

# 사건별 필터링
GET /api/analysis/jobs?caseId=<uuid>

# 작업 유형별 필터링
GET /api/analysis/jobs?jobType=per-evidence
GET /api/analysis/jobs?jobType=case-aggregate

# 특정 증거 관련 작업
GET /api/analysis/jobs?evidenceId=<uuid>
```

### 작업 상세 정보

```bash
GET /api/analysis/jobs/:jobId
# 응답: { job: {...}, artifacts: [{kind, filePath}, ...] }
```

### 작업 재시도

```bash
POST /api/analysis/retry/:jobId
```

## 작업 흐름

### 증거 업로드 시

1. `POST /api/evidence/upload` (파일 + 메타데이터)
2. Evidence 엔티티 생성 → 스토리지 저장
3. `enqueueForEvidence(evidenceId)` 호출 → 개별 분석 작업 생성
4. `caseId`가 있으면 `enqueueForCase(caseId)` 호출 → 종합 분석 작업 생성

### 분석 실행 (백그라운드)

1. `analysisRunner` 큐에서 작업 가져오기
2. **Per-Evidence**: 단일 증거 분석 → MD + PDF 생성
3. **Case-Aggregate**: 모든 사건 증거 종합 → MD + PDF 생성
4. AnalysisArtifact 엔티티 생성
5. 선택적으로 Evidence 엔티티로 결과물 등록 (탐정/의뢰인 파일 접근용)

## Azure 리소스 설정

### 1. Azure OpenAI 리소스 생성

1. Azure Portal → "Azure OpenAI" 검색
2. 리소스 생성 (위치: East US, Sweden Central 등 GPT-4 지원 지역)
3. 모델 배포: `gpt-4o-mini` 또는 `gpt-4o`
4. 키 및 엔드포인트 복사

### 2. 향후 Azure 서비스 (선택사항)

- **Document Intelligence**: OCR 및 문서 구조 분석
- **Speech Service**: 음성-텍스트 변환
- **Video Indexer**: 비디오 인덱싱 및 인사이트 추출
- **Computer Vision**: 이미지 분석 및 OCR

## 트러블슈팅

### "AI provider not configured" 오류

→ `.env` 파일에 `ANALYSIS_PROVIDER` 및 관련 API 키 설정 확인

### 분석 작업이 "queued" 상태에서 멈춤

→ 백엔드 로그 확인, AI 엔드포인트 연결 상태 점검

### PDF 생성 실패

→ pdfkit 의존성 설치 확인: `npm install pdfkit @types/pdfkit`

### 종합 분석이 실행되지 않음

→ 증거에 `caseId`가 설정되어 있는지 확인

## 개발 참고

### 미디어 플러그인 확장

`src/services/ai.ts`에서 각 함수 수정:

```typescript
async function extractTextFromDocument(
  buffer: Buffer,
  filename: string
): Promise<string> {
  // TODO: Azure Document Intelligence 연동
  // const client = new DocumentAnalysisClient(endpoint, credential);
  // const result = await client.beginAnalyzeDocument("prebuilt-read", buffer);
  return "extracted text...";
}
```

### 분석 프롬프트 커스터마이징

`ai.ts`의 `analyzeEvidence` 및 `analyzeCase` 함수에서 `systemPrompt`, `userPrompt` 수정

### 새 작업 유형 추가

1. `AnalysisJob.jobType`에 새 타입 추가
2. `analysisRunner.ts`의 `runLoop`에 분기 로직 추가
3. 필요 시 새 enqueue 함수 작성
