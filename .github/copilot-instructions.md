# PIIP 플랫폼 - AI 코딩 에이전트 가이드

## 프로젝트 개요
PIIP는 탐정 업무 관리를 위한 모노레포 플랫폼으로, Node.js 백엔드, React 프론트엔드, 모바일 앱으로 구성되어 있습니다.
- **루트:** Turbo 레포로 워크스페이스(`packages/*`) 관리
- **백엔드:** Express, Socket.IO, 하이브리드 DB (MongoDB + TypeORM), AI 에이전트
- **프론트엔드:** Vite + React (SPA)
- **모바일:** Vite + React Native Web

## 아키텍처 및 패턴

### 백엔드 (`packages/backend`)
- **진입점:** `src/index.ts` - Express 및 Socket.IO 시작
- **데이터베이스:** 하이브리드 아키텍처
  - **MongoDB:** Mongoose (`config/mongodb.ts`) - 사건/접수/상담 데이터의 주 저장소
  - **SQL (SQLite/PG):** TypeORM (`config/database.ts`) - 구조화된 엔티티(증거, 보고서, 사용자 등) 저장
- **AI 통합:** `services/intakeAgent.ts`, `services/ai.ts`, `services/caseAssignment.ts`
  - `ANALYSIS_PROVIDER` 환경변수로 `mock`, `openai`, `azure-openai` 프로바이더 지원
  - **패턴:** 외부 AI 호출 전 항상 `ANALYSIS_PROVIDER` 확인. API 키 없이 로컬 개발 시 `mock` 사용
  - 예시: `const PROVIDER = (process.env.ANALYSIS_PROVIDER || "mock").toLowerCase();`
- **실시간 통신:** Socket.IO와 JWT 인증 (`index.ts`의 `io.use(...)`)
  - `handshake.auth.token` 또는 `Authorization` 헤더를 통한 인증
  - 소켓 데이터에 사용자 정보 저장: `socket.data.user = { userId, email, role, detectiveId }`
- **스토리지:** 플러그형 저장소 시스템 (`services/storage.ts`)
  - `STORAGE_PROVIDER`: `local` (기본값) 또는 `s3`
  - 로컬: `uploads/` 디렉토리에 파일 저장
  - S3: `S3_BUCKET`, `AWS_REGION` 필수, `S3_PUBLIC_URL_BASE` 선택사항
  - 파일 정리: `LOCAL_AUTOCLEAN=true` 설정 시 `FILE_RETENTION_DAYS` 후 자동 삭제
- **알림:** Twilio SMS (`services/notificationService.ts`)
  - `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM` 환경변수 필요

### 프론트엔드 (`packages/frontend`)
- **빌드:** Vite (`vite.config.ts`)
- **API 프록시:** `vite.config.ts`에서 `/api` 및 `/socket.io`를 백엔드로 전달
  - **로컬:** `http://localhost:5001`
  - **Docker:** `VITE_API_BASE`로 백엔드 컨테이너 지정 (예: `http://piip-backend:5001`)
- **소켓 클라이언트:** `src/hooks/useSocket.ts` - 연결 및 인증 토큰 처리
  - `VITE_API_BASE` 읽거나 기본값 `http://localhost:5001` 사용
  - `localStorage.getItem('piip_token')`에서 JWT를 `auth: { token }`으로 전달
- **상태 관리:** Redux Toolkit (`@reduxjs/toolkit`) 및 React Query (`@tanstack/react-query`)

### 모바일 (`packages/mobile`)
- **빌드:** React Native Web용 Vite
- **플랫폼:** 크로스 플랫폼 호환성을 위한 React Native Web

## 핵심 워크플로우
# PIIP 플랫폼 — AI 코딩 에이전트 가이드 (간결)

이 파일은 PIIP 모노레포를 빠르게 이해하고 안전하게 변경할 수 있도록 핵심 규칙과 진입점을 정리합니다.

1) 한 줄 요약
- 모노레포: `packages/backend`(Express + Socket.IO + AI), `packages/frontend`(Vite/React), `packages/mobile`.

2) 빠른 실행(로컬)
- 전체 개발: `npm run dev` (루트, Turborepo로 패키지 병렬 실행)
- 백엔드만: `npm run backend` 또는 `cd packages/backend && npm run dev`
- 프론트엔드만: `cd packages/frontend && npm run dev`
- Docker: `docker compose up -d --build`

3) 가장 먼저 읽어야 할 파일
- 백엔드 진입점: `packages/backend/src/index.ts`
- AI 관련: `packages/backend/src/services/intakeAgent.ts`, `packages/backend/src/services/ai.ts`
- 스토리지: `packages/backend/src/services/storage.ts` (local/S3 플러그인)
- Socket 클라이언트: `packages/frontend/src/hooks/useSocket.ts`
- API 스펙: `docs/openapi/openapi.yaml`

4) 중요한 환경변수 / 런타임 규칙
- `ANALYSIS_PROVIDER` = `mock|openai|azure-openai` (로컬 개발은 `mock` 권장)
- `STORAGE_PROVIDER` = `local|s3` (로컬 업로드는 `uploads/`)
- `MONGO_URI`, `JWT_SECRET`, `AZURE_OPENAI_API_KEY` / `OPENAI_API_KEY`
- `VITE_API_BASE` (프론트엔드가 백엔드를 호출할 때 사용)
- 기본 백엔드 포트: `PORT` default `5001` (Docker 내부에서는 서비스명 사용)

5) Socket.IO 인증 패턴
- 서버는 `handshake.auth.token` 또는 `Authorization` 헤더를 기대합니다 (`packages/backend/src/index.ts`).
- 인증 후 `socket.data.user`에 `{ userId, email, role, detectiveId }`를 채웁니다.

6) AI 호출/보안 규칙
- 코드에서 AI 클라이언트를 만들기 전 항상 `ANALYSIS_PROVIDER` 확인.
- 키는 절대 하드코딩하지 말고 환경변수로 주입.

7) API 변경 시 작업 플로우
- API 변경: `docs/openapi/openapi.yaml` 업데이트 → 루트에서 `npm run openapi:gen` 실행 → `packages/sdk` 갱신.

8) 테스트/검증
- E2E: `cd packages/frontend && npx playwright test` (Playwright traces 폴더 존재)
- 백엔드 유닛: `cd packages/backend && npm test`

9) Docker / 네트워킹 주의
- 컨테이너 간 통신: `localhost` 대신 서비스 이름 사용 (예: `http://piip-backend:5001`).

10) 작업 가이드(간단 체크리스트)
- 변경 전: 관련 유닛/통합 테스트 실행
- API 변경 시: OpenAPI 스펙과 SDK 동기화
- AI 관련 변경: `ANALYSIS_PROVIDER` 호환성과 키 안전성 검토

피드백: 더 자세히 원하는 영역(예: DB 마이그레이션 흐름, AI 에러 처리 패턴 등)을 알려주시면 본 파일을 확장해 반영하겠습니다.
