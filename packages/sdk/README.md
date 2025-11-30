# @piip/sdk

자동 생성된 TypeScript Fetch 기반 클라이언트 SDK입니다. OpenAPI 스펙(`../../docs/openapi/openapi.yaml`)을 바탕으로 `openapi-typescript-codegen`으로 생성되었습니다.

## 설치 (로컬 워크스페이스 참조)

```bash
npm install @piip/sdk
```

## 초기화

```typescript
import { OpenAPI, CasesService } from "@piip/sdk";

OpenAPI.BASE = "http://localhost:4001"; // 서버 실제 포트
OpenAPI.TOKEN = async () => "JWT_TOKEN_STRING";

const cases = await CasesService.listCases({ page: 1, pageSize: 10 });
console.log(cases.items);
```

## 로그인 후 토큰 설정 예시

```typescript
import { AuthService, OpenAPI } from "@piip/sdk";

async function login(email: string, password: string) {
  const res = await AuthService.login({ requestBody: { email, password } });
  OpenAPI.TOKEN = res.accessToken; // 단순 설정 (보안 고려 필요)
  return res.user;
}
```

## 재생성

루트에서 스펙 변경 후 SDK 재생성:

```bash
npm run gen:sdk:node
```

(또는 OpenAPI Generator 버전: `npm run gen:sdk`)

## 개발 권장 사항

- 스펙 변경 시 CI에서 SDK 재생성 및 변경 파일 커밋
- BREAKING 변경 시 SDK 버전 증가 (SemVer)
- 추가 헬퍼/도메인 함수는 별도 hand-written 모듈로 `packages/sdk/src` 확장
