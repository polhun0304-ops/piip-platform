# PIIP Backend

탐정 플랫폼 백엔드 서버 - Express + TypeScript + TypeORM + SQLite

## 주요 기능

### 📁 증거 관리

- 파일 업로드 (이미지, 비디오, 오디오, 문서)
- 사건별 증거 분류 및 조회
- 스토리지 추상화 (로컬 디스크 / AWS S3)
- JWT 인증을 통한 안전한 파일 접근

### 🎥 Twilio 통합

- 실시간 비디오/음성 통화
- 자동 녹음 및 증거 저장
- 웹훅 서명 검증 (보안)

### 🤖 AI 심층 분석 (Azure OpenAI)

- **개별 증거 분석**: 업로드 즉시 자동 심층 분석
- **사건 종합 분석**: 모든 증거를 통합하여 전체 맥락 파악
- **자동 재분석**: 새 증거 추가 시 사건 전체 재분석
- **미디어 타입별 플러그인**: 문서/오디오/비디오/이미지 각각 최적화
- **이중 산출물 생성**:
  - 편집 가능한 Markdown (탐정용)
  - 수정 불가능한 PDF (의뢰인용)

### 🔐 보안

- JWT 토큰 기반 인증/인가
- Twilio 웹훅 서명 검증
- HTTPS 환경 지원 (trust proxy)
- 환경 변수 기반 민감 정보 관리

## 설치 및 실행

```bash
# 의존성 설치
npm install --legacy-peer-deps

# 환경 변수 설정 (.env 파일 생성)
cp .env.example .env

# 개발 모드 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 환경 변수 구성

필수 항목은 `.env` 파일에 설정:

```env
# 데이터베이스
DATABASE_PATH=./piip.sqlite

# JWT 인증
JWT_SECRET=your-secret-key-here

# Twilio (선택사항)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_API_KEY_SID=SKxxx
TWILIO_API_KEY_SECRET=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WEBHOOK_VALIDATION=permissive  # strict | permissive

# 스토리지 (local 또는 s3)
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./uploads
# STORAGE_PROVIDER=s3
# AWS_REGION=ap-northeast-2
# AWS_S3_BUCKET=piip-evidence

# AI 분석 (Azure OpenAI 권장)
ANALYSIS_ENABLED=true
ANALYSIS_PROVIDER=azure-openai
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

# 선택사항
ANALYSIS_CREATE_EVIDENCE=true  # 분석 결과를 증거로 등록
PUBLIC_BASE_URL=https://your-domain.com  # 웹훅 검증용
```

상세 설정은 [AZURE_OPENAI_SETUP.md](./AZURE_OPENAI_SETUP.md) 참고

## API 엔드포인트

### 증거 (Evidence)

- `GET /api/evidence?caseId=<uuid>` - 증거 목록 조회
- `GET /api/evidence/:id` - 증거 상세 조회
- `POST /api/evidence` - 증거 생성 (메타데이터만)
- `POST /api/evidence/upload` - 파일 업로드 + 증거 생성 (multipart)
- `PUT /api/evidence/:id` - 증거 수정
- `DELETE /api/evidence/:id` - 증거 삭제

### 파일 접근 (JWT 인증 필수)

- `GET /api/files/url?path=<path>` - 파일 다운로드 URL 생성
- `GET /api/files/download?path=<path>` - 파일 직접 다운로드

### AI 분석 (JWT 인증 필수)

- `GET /api/analysis/jobs` - 분석 작업 목록
- `GET /api/analysis/jobs?caseId=<uuid>` - 사건별 작업
- `GET /api/analysis/jobs?jobType=per-evidence` - 개별 증거 분석만
- `GET /api/analysis/jobs?jobType=case-aggregate` - 종합 분석만
- `GET /api/analysis/jobs/:jobId` - 작업 상세 + 산출물
- `POST /api/analysis/retry/:jobId` - 작업 재시도

### Twilio

- `POST /api/twilio/video/token` - 비디오 통화 토큰 생성
- `POST /api/twilio/webhook` - 녹음 완료 웹훅 (서명 검증)

### 인증

- `POST /api/auth/login` - 로그인 (JWT 토큰 발급)
- `POST /api/auth/register` - 회원가입

## 기술 스택

- **언어**: TypeScript 5.x
- **프레임워크**: Express 4.x
- **ORM**: TypeORM (SQLite)
- **AI**: Azure OpenAI SDK, OpenAI SDK
- **문서 생성**: pdfkit
- **스토리지**: AWS S3 SDK (선택적)
- **실시간 통신**: Twilio SDK, Socket.io
- **인증**: jsonwebtoken
- **파일 업로드**: multer

## 아키텍처

### 분석 파이프라인

```
증거 업로드
    ↓
enqueueForEvidence (개별 분석 작업 생성)
    ↓
analysisRunner → analyzeEvidence (AI 플러그인)
    ↓
AnalysisArtifact (MD + PDF)
    ↓
선택적으로 Evidence 엔티티 등록
```

```
증거 업로드 (caseId 포함)
    ↓
enqueueForCase (종합 분석 작업 생성)
    ↓
analysisRunner → analyzeCase (모든 사건 증거 통합)
    ↓
AnalysisArtifact (종합 MD + PDF)
    ↓
선택적으로 Evidence 엔티티 등록
```

### 엔티티

- **Evidence**: 증거 파일 메타데이터 (label, type, date, filePath, caseId)
- **Case**: 사건 정보 (title, status, description)
- **User**: 사용자 (email, password, role)
- **AnalysisJob**: 분석 작업 (jobType, status, evidenceId?, caseId?)
- **AnalysisArtifact**: 분석 산출물 (kind: editable|immutable, filePath)

### 미디어 타입 플러그인

`src/services/ai.ts`에 구현:

- `extractTextFromDocument`: 문서 → 텍스트 추출
- `transcribeAudio`: 오디오 → 텍스트 변환
- `summarizeVideo`: 비디오 → 요약 생성
- `describeImage`: 이미지 → 설명 생성

향후 Azure 서비스 연동 예정:

- Azure Document Intelligence (OCR)
- Azure Speech to Text (음성 인식)
- Azure Video Indexer (비디오 분석)
- Azure Computer Vision (이미지 분석)

## 개발 가이드

### 새 엔드포인트 추가

```typescript
// src/routes/myroute.ts
import { Router } from "express";
import { verifyJWT } from "../middleware/auth";

const router = Router();
router.use(verifyJWT); // 인증 필요 시

router.get("/", async (req, res) => {
  // ...
});

export default router;
```

```typescript
// src/index.ts
import myRoute from "./routes/myroute";
app.use("/api/myroute", myRoute);
```

### AI 플러그인 확장

```typescript
// src/services/ai.ts
async function extractTextFromDocument(
  buffer: Buffer,
  filename: string
): Promise<string> {
  // Azure Document Intelligence 연동
  const {
    DocumentAnalysisClient,
    AzureKeyCredential,
  } = require("@azure/ai-form-recognizer");
  const client = new DocumentAnalysisClient(
    endpoint,
    new AzureKeyCredential(apiKey)
  );
  const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer);
  const result = await poller.pollUntilDone();
  return result.content;
}
```

### 마이그레이션

TypeORM CLI 사용:

```bash
npm run typeorm migration:generate -- -n MyMigration
npm run typeorm migration:run
```

## 배포

### Docker (예정)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### 환경 변수 확인 체크리스트

- [ ] `JWT_SECRET` 설정 (프로덕션: 강력한 랜덤 문자열)
- [ ] `STORAGE_PROVIDER` 설정 (local 또는 s3)
- [ ] S3 사용 시: `AWS_REGION`, `AWS_S3_BUCKET` 설정
- [ ] Twilio 사용 시: `TWILIO_*` 변수 설정, 웹훅 검증 `strict` 모드
- [ ] AI 분석 사용 시: `AZURE_OPENAI_*` 변수 설정
- [ ] `PUBLIC_BASE_URL` 설정 (HTTPS 도메인)

## 라이선스

MIT
