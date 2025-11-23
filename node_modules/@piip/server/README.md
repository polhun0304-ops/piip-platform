# PIIP Server (Express + TypeScript)

OpenAPI 스펙(`../../docs/openapi/openapi.yaml`) 기반 서버.

1. 구현 라우트: `/auth/login`, `/cases`, `/reports`
2. 자동 스텁(501): 스펙에 선언됐지만 미구현된 나머지 경로 (동적 등록)
3. 문서: Swagger UI `/docs`, JSON `/openapi.json`

## 빠른 시작

```powershell
# 루트에서 설치
npm install

# 서버 패키지 진입 및 실행 (포트 자동 회피)
cd packages/server
npm run dev
# http://localhost:3000/docs (점유 시 3001, 3002 ...)
```

## 환경 변수

| 변수       | 기본값               | 설명                                          |
| ---------- | -------------------- | --------------------------------------------- |
| PORT       | 3000                 | 시작 포트, 점유 시 +1 증가 재시도 (최대 10회) |
| JWT_SECRET | dev-secret-change-me | JWT 서명 키 (운영환경 필수 교체)              |

`.env.example` 참고.

### Observability / Tracing / Metrics

추가 환경 변수들:

| 변수                               | 기본값        | 설명                                                                                                |
| ---------------------------------- | ------------- | --------------------------------------------------------------------------------------------------- |
| OTEL_SERVICE_NAME                  | `piip-server` | OpenTelemetry 서비스명(Resource)                                                                    |
| OTEL_EXPORTER_OTLP_ENDPOINT        | 없음          | Collector 베이스 URL (예: `http://localhost:4318`) 설정 시 traces 엔드포인트 자동 파생 `/v1/traces` |
| OTEL_EXPORTER_OTLP_TRACES_ENDPOINT | 없음          | Traces 전용 풀 URL(위 값보다 우선)                                                                  |
| OTEL_EXPORTER_OTLP_HEADERS         | 없음          | OTLP 요청 헤더. 형식: `key=value,key2=value2` 또는 세미콜론 구분 가능                               |
| OTEL_DEBUG                         | 없음          | 설정 시 SDK 시작/종료 로그 출력                                                                     |
| METRICS_EXPOSE                     | `all`         | `internal` 설정 시 `/metrics`는 로컬호스트(127.0.0.1) 요청만 허용                                   |

메트릭은 `prom-client`로 수집: `http_requests_total`, `http_request_duration_seconds` (튜닝된 히스토그램 버킷) 등. 라우트 라벨은 Express 라우트 패턴(`baseUrl + route.path`) 기준.

OTLP Collector 예시 (Docker Compose):

```yaml
services:
	otel-collector:
		image: otel/opentelemetry-collector-contrib:latest
		command: ["--config=/etc/otel-collector-config.yaml"]
		ports:
			- "4318:4318" # OTLP HTTP
		volumes:
			- ./otel-collector-config.yaml:/etc/otel-collector-config.yaml:ro
```

`otel-collector-config.yaml` 간단 예시:

```yaml
receivers:
	otlp:
		protocols:
			http:
exporters:
	logging: { }
	prometheus:
		endpoint: 0.0.0.0:9464
	otlp:
		endpoint: some-backend:4317
processors:
	batch: {}
service:
	pipelines:
		traces:
			receivers: [otlp]
			processors: [batch]
			exporters: [logging]
		metrics:
			receivers: [otlp]
			processors: [batch]
			exporters: [logging]
```

로컬 개발 시 최소 구성: `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` 만 설정하면 traces 전송.

### 헤더 파싱 규칙

`OTEL_EXPORTER_OTLP_HEADERS`는 쉼표(,) 또는 세미콜론(;)로 구분된 `key=value` 쌍. 값 누락 시 빈 문자열로 전송.

### /metrics 보호 전략

운영 환경에서 외부 노출 필요 없으면 `METRICS_EXPOSE=internal` 로 설정 후 Prometheus는 sidecar 혹은 NodePort로 스크랩.

### 스케줄/라벨 정책 (CI)

주간 스케줄(`0 3 * * 1`)로 OpenAPI → SDK 동기화 검사. 자동 생성 PR에는 라벨: `chore`, `openapi`, `sdk` 적용.
추가 권장 라벨:

- `spec-change`: 스펙 구조 변경
- `breaking`: 호환성 깨짐
- `observability`: 추적/메트릭 관련 변경

리뷰어 정책: 기본적으로 저장소 소유자. 팀 확장 시 CODEOWNERS 사용 권장.

## 스크립트

- `npm run dev`: 개발 모드(ts-node-dev)
- `npm run build`: TypeScript 컴파일
- `npm start`: dist 실행

## 구조 개요

| 경로                                 | 설명                                |
| ------------------------------------ | ----------------------------------- |
| `src/server.ts`                      | 앱 초기화 / Swagger / 포트 자동회피 |
| `src/openapi/spec.ts`                | YAML 스펙 로더                      |
| `src/openapi/registerFromOpenApi.ts` | 미구현 경로 501 자동 라우트 등록    |
| `src/middleware/auth.ts`             | JWT + 역할/스코프 검증              |
| `src/middleware/validate.ts`         | Zod 기반 body/query/params 검증     |
| `src/repositories/memory.ts`         | 인메모리 Case/Report 저장소         |
| `src/routes/cases.ts`                | 사건 CRUD + 상태 전이               |
| `src/routes/reports.ts`              | 리포트 CRUD + 제출                  |
| `src/middleware/error.ts`            | 404 / 에러 처리                     |

## 인증 & 권한

로그인 시 HS256 JWT 발급. 이메일 패턴에 따라 역할:

- 포함 `admin` → admin
- 포함 `detective` → detective
- 그 외 → client

역할 기본 스코프:

- client: `cases:read`, `cases:write`, `reports:read`, `reports:write`
- detective: `cases:read`, `reports:read`, `reports:write`, `evidences:upload`
- admin: `admin:all`

토큰 payload에 `scopes` 배열 있으면 재정의 가능. `admin:all`은 전체 허용.

## 요청 검증 & 오류 포맷

Zod 실패 → 422:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request body",
  "details": {}
}
```

권한 부족 → 403, 인증 실패 → 401.

## 샘플 cURL

```bash
# 로그인
auth=$(curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"Passw0rd!"}')
TOKEN=$(echo $auth | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 사건 생성
curl -s -X POST http://localhost:3000/cases \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{"title":"사건A","description":"설명"}'

# 사건 목록
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3000/cases?page=1&pageSize=5"
```

## 스펙 & SDK 재생성

```bash
npm run openapi:gen   # packages/sdk 재생성
```

`packages/sdk/README.md` 참고.

## 향후 개선 로드맵

- DB 영속화(PostgreSQL + Prisma/TypeORM)
- 진짜 인증(비밀번호 해시, Refresh Token, 세션 무효화)
- Webhooks: 시그니처/재시도 큐
- Observability: pino 로깅, metrics, tracing(OpenTelemetry)

### 추가 문서

심화 설정은 `docs/observability.md` (생성 예정) 에서 Collector 파이프라인/대시보드 구성 예시 제공 예정.

- CI: 스펙 diff → SDK/서버 재생성 자동검증
- 테스트: Vitest/Jest + supertest 통합

## 라이선스 / 상태

INTERNAL DRAFT – 외부 공개 전 보안 및 스키마 재검토 필요.
