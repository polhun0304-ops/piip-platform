# PIIP — AI Agent Instructions (간결판)

**목표:** 에이전트가 로컬 개발, 디버깅, E2E 재현, Docker 재현을 빠르게 수행하도록 핵심 지식과 실행 절차를 제공합니다.
**핵심 개요**

- 레포 구조: 모노레포(`packages/*`) — 핵심은 `packages/backend`(Express + TypeORM + Mongo), `packages/frontend`(Vite + React)
- 백엔드: REST `/api/*` + Socket.IO (JWT 핸드셰이크). 엔트리: `packages/backend/src/index.ts` (DB 초기화: `initializeDatabase()`)
- 프런트: Vite dev 서버(`packages/frontend/vite.config.ts`)가 `/api` 프록시를 사용함. 소켓 클라이언트: `packages/frontend/src/hooks/useSocket.ts` (`VITE_API_BASE`).
  **빠른 실행(핵심 명령)**

```powershell
npm install
npm run dev         # turbo로 전체 서비스 실행
npm run backend     # 백엔드만 (root script)
cd packages/frontend; npm run dev
docker compose up -d --build
docker ps -a
docker logs --tail 200 piip-backend
**환경 변수 핵심**
- `PORT`, `JWT_SECRET`, `CORS_ORIGIN`
- AI 관련: `ANALYSIS_PROVIDER` (`mock|openai|azure-openai`), `OPENAI_API_KEY`, `OPENAI_MODEL`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`
- 파일/스토리지: `STORAGE_PROVIDER` (`local|s3`) — S3일 경우 추가 설정 필요
**자주 발생하는 문제와 해결 포인트**
- Docker 내부에서 프록시 실패(ECONNREFUSED): `packages/frontend/vite.config.ts`의 proxy가 `http://localhost:5001`인 경우 컨테이너 내부에서는 백엔드로 연결 불가.
  - 해결: `docker-compose.yml` 또는 컨테이너 env로 `VITE_API_BASE=http://piip-backend:5001` 설정 (서비스 이름 사용).
- Socket 연결 실패: 서버의 Socket.IO 핸드셰이크는 JWT를 검사합니다. 테스트/재현 시 `localStorage`에 `piip_token`을 넣거나 Playwright에서 Authorization 헤더 사용.
- 로컬에서 AI 호출 불가: `ANALYSIS_PROVIDER=mock`로 설정해 외부 호출을 우회하세요.
**테스트(Playwright) 관련**
- 설치: `cd packages/frontend && npm run playwright:install`
- 실행(추적 포함): `npx playwright test --trace on`
- 실패 재현 팁: Playwright에서 `ERR_CONNECTION_REFUSED` 또는 `Timeout`이 보이면 백엔드(5001)와 프런트(5173)가 동작하는지 먼저 확인하세요.
**중요 파일(참고용)**
- 백엔드 엔트리: `packages/backend/src/index.ts`
- 케이스/할당 관련: `packages/backend/src/routes/cases.ts`
- AI 통합: `packages/backend/src/services/intakeAgent.ts`
- Vite 설정: `packages/frontend/vite.config.ts`
- Socket helper: `packages/frontend/src/hooks/useSocket.ts`
- Playwright 테스트: `packages/frontend/playwright`

필요하면 이 파일을 더 짧은 체크리스트형(핵심 명령만) 또는 CI(예: GitHub Actions)용 검사 목록으로 확장하겠습니다.
# Copilot / AI Agent Instructions for PIIP Platform

Short summary

- Monorepo: `packages/backend` (Node/Express, TypeORM + Mongo bootstrap), `packages/frontend` (Vite + React), `packages/sdk`, `packages/mobile`.
- Backend exposes REST + Socket.IO on `/api` and websockets; frontend uses Vite dev server with a proxy to `/api`.

Quick start (developer-relevant)

- Install deps at repo root (workspaces):
  - `npm install` (root) — uses workspaces/turbo.
- Local dev (recommended for active development):
  - From root: `npm run dev` (runs turbo pipelines). For Windows PowerShell there is `start-dev.ps1` which helps launch services and ensures UTF-8 output.
  - To run only backend: `npm run backend` (root) or `cd packages/backend && npm run dev`.
  - To run frontend: `cd packages/frontend && npm run dev`.
- Dockerized full stack:
  - `docker compose up -d --build` from repo root. Watch logs — common failure is frontend proxying to `http://localhost:5001` inside container.

Key architectural notes (what to know first)

- Backend (`packages/backend/src/index.ts`):
  - Initializes MongoDB connection then calls `initializeDatabase()` (TypeORM/SQLite for some data). Listens on `process.env.PORT || 5001`.
  - Socket.IO handshake performs JWT verification. See `io.use(...)` and `JWT_SECRET` usage.
  - Many features are behind routes under `/api/*` (auth, cases, intake, analysis, chat, e2ee).
- AI integration:
  - `packages/backend/src/services/intakeAgent.ts` toggles between `mock`, `openai`, and `azure-openai` via `ANALYSIS_PROVIDER` (or `OPENAI_API_KEY` / `AZURE_OPENAI_*` envs). The code falls back to a mock response if envs are missing.
- Frontend:
  - Vite dev server config at `packages/frontend/vite.config.ts` — note the proxy target for `/api` is `http://localhost:5001` (change to `http://piip-backend:5001` when running inside Docker).
  - Socket client uses `import.meta.env.VITE_API_BASE` fallbacking to `http://localhost:5001` in `src/hooks/useSocket.ts`.

Developer workflows and gotchas

- Running tests (E2E):
  - Playwright tests live under `packages/frontend/playwright` (or `packages/frontend`) — install browsers: `cd packages/frontend && npm run playwright:install` then `npx playwright test --trace on`.
  - Troubleshooting tips: when Playwright sees `ERR_CONNECTION_REFUSED` to `localhost:5173` or `localhost:5001`, check whether services run locally or whether the frontend in Docker is proxying to `127.0.0.1` (wrong inside-container target).
- Seeding and DB: backend runs `initializeDatabase()` and seed scripts; seed idempotency messages (`Template already exists`) are expected.
- Environment variables that commonly affect agent work:
  - `PORT`, `JWT_SECRET`, `ANALYSIS_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, `CORS_ORIGIN`, `STORAGE_PROVIDER`.
  - For local dev without OpenAI: set `ANALYSIS_PROVIDER=mock` to avoid external calls.

Project-specific conventions

- Monorepo uses `turbo` workspaces — prefer top-level `npm run dev` for concurrently running services during development.
- Frontend environment keys are `VITE_*` (Vite injects these). Examples: `VITE_API_BASE`, `VITE_API_URL`, `VITE_DEBUG_E2EE`.
- Socket.IO auth: tokens may come from `handshake.auth.token` or `Authorization` header; many tests set `piip_token` in localStorage directly.

Integration points to inspect when changing behavior

- API surface: `packages/backend/src/routes/*` (auth, cases, assignments, chat, intake). Example: `routes/cases.ts` controls detective assignment and affects what `나의사건` shows.
- Real-time: server Socket.IO logic in `packages/backend/src/index.ts` and client socket helper `packages/frontend/src/hooks/useSocket.ts`.
- AI flows: `packages/backend/src/services/intakeAgent.ts` and downstream `consultationGating` / `caseAssignment` modules; changing prompts or provider selection requires env updates and optional model/deployment naming.

How to contribute safe changes (practical rules)

- Keep changes minimal and focused; follow existing TypeScript style. Match the project's Node engine (`node >=20 <25`).
- When modifying cross-cutting behavior (auth, socket, API paths), run both local dev and Playwright E2E to confirm behavior.
- For Docker fixes: change Vite proxy or `VITE_API_BASE` in `packages/frontend/.env.docker` (or set env in `docker-compose.yml`) — prefer changing env over hardcoding hostnames in code.

Where to look first when debugging common issues

- Backend crashes on container start: collect `docker logs --tail 1000 piip-backend` and look for missing envs or thrown exceptions during DB init.
- Frontend proxy ECONNREFUSED: open `packages/frontend/vite.config.ts` and `packages/frontend/src/hooks/useSocket.ts` to ensure `VITE_API_BASE` is set for container environment.
- Playwright flakiness: traces are saved under `packages/frontend/test-results` / `archives/playwright-traces` during runs performed by the CI/dev agent; use `npx playwright show-trace <trace.zip>` to replay.

If anything is unclear or you want this to tilt more toward a specific agent style (e.g., more strict testing steps, or an interactive repair checklist), tell me which sections to expand and I will iterate.
```
