# PR: feat(frontend): add useMessages/useCase/useSocket hooks, typed DTOs, refactor SecureChat

## 개요

이 PR은 프런트엔드의 데이터 계층을 표준화하고 채팅/소켓 코드를 정리하기 위한 기초 작업입니다. 주요 변경사항은 다음과 같습니다:

- 타입 안전성:
  - `src/types/api.ts` — `MessageDTO`, `CaseDTO` 추가

- React Query 훅:
  - `src/hooks/useMessages.ts` — 채팅 메시지 조회 + query cache append helper
  - `src/hooks/useCase.ts` — 케이스 조회 훅

- Socket 추상화:
  - `src/hooks/useSocket.ts` — 간단한 Socket.IO 구독/emit/cleanup 추상화

- 컴포넌트 리팩터:
  - `src/components/SecureChat.tsx` — 직접 API 호출/로컬 메시지 상태 사용을 `useMessages`/`useSocket`으로 교체. E2EE(클라이언트 키관리·수신자별 암호화) 로직은 유지.

- api client 보강:
  - `src/services/api.ts` — `getCase`, `getMessages` 타입화된 편의 함수 추가

## 변경된 파일

- 추가
  - `packages/frontend/src/types/api.ts`
  - `packages/frontend/src/hooks/useMessages.ts`
  - `packages/frontend/src/hooks/useCase.ts`
  - `packages/frontend/src/hooks/useSocket.ts`
  - `packages/frontend/DETAILED-UI-AUDIT.md`
  - `packages/frontend/PR_PREP.md`
  - `packages/frontend/PR_BODY.md` (이 파일)

- 수정
  - `packages/frontend/src/components/SecureChat.tsx`
  - `packages/frontend/src/services/api.ts`

## 동작 확인 방법 (로컬)

1. Node 버전 확인 (프로젝트 요구: Node >=20 <21)

```powershell
node -v
```

1. 의존성 설치

```powershell
# 루트(워크스페이스)에서
npm ci

# 또는 frontend만
npm ci --prefix packages/frontend
```

1. 타입 체크

```powershell
npx tsc --noEmit --project packages/frontend/tsconfig.json
```

1. 린트

```powershell
npm --prefix packages/frontend run lint
```

1. 개발 서버 확인

```powershell
npm --prefix packages/frontend run dev
```

1. (선택) headless E2E

```powershell
npm --prefix packages/frontend run test:e2e
# 또는
node packages/frontend/test/e2ee-headless.js
```

## CI 기대 동작

- 프론트엔드 `build` (Node 20) — Vite 빌드 성공
- headless E2E — `packages/frontend/test/e2ee-headless.js` 실행 성공
- Lint와 타입 체크 통과

## 체크리스트

- [ ] Node 버전 요구사항 문서화
- [ ] 타입체크 (tsc) 통과
- [ ] ESLint 통과
- [ ] 로컬 e2e(있는 경우) 실행 검증
- [ ] SecureChat 동작 수동 확인

## 메모

- 이 PR은 서버 API 변경 없이 동작하도록 설계되었습니다. 서버가 메시지 수신 시 Socket.IO로 `chat:message`를 발행한다고 가정합니다.
- 이후 PR: 낙관 업데이트(전송 시 즉시 쿼리 캐시 업데이트), 메시지 배치, useMessages의 mutation 훅 추가, SecureChat의 테스트 커버리지 추가.

---

작성자: 자동 생성
