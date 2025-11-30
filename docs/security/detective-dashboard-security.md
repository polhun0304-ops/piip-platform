# Detective Dashboard Security Checklist

목표: 탐정 대시보드와 관련된 인증/인가, 파일 업로드, 실시간 통신, 로그/감사, 데이터 노출 등을 점검하고 권장 보안 조치를 정리합니다.

## 요약

- 중요 대상: 증거 업로드조회수정삭제 API, AI 증거분석 UI, Socket.IO 실시간 연결
- 우선순위: 인증/인가(P0), 파일 업로드 안전(P0), 접근 통제(P0), 실시간 인증(P1), 로깅/감사(P1)

## 점검 항목(핵심)

1. 인증/인가 (AuthN/AuthZ)
   - 모든 증거 관련 엔드포인트에 인증 미들웨어 적용
   - 서버측 역할 기반 권한 검사(클라이언트는 자신의 사건만 접근, 탐정은 할당된 사건만)

2. 파일 업로드 보안
   - 업로드 허용 파일 타입과 MIME 서명(파일 시그니처) 검사
   - 파일명 정규화, 경로 순환(Path traversal) 방지
   - 업로드 크기 제한 및 스토리지 ACL/서명된 URL 사용

3. 접근 통제
   - `caseId`에 대한 소유권/할당 여부 확인
   - 서버측에서 항상 권한을 재검증(클라이언트 신뢰 금지)

4. 실시간 통신(Socket.IO)
   - 핸드셰이크 단계에서 JWT 검증
   - 이벤트 수신 시 서버측에서 다시 권한/입력 검증

5. 민감 데이터 노출
   - 로그에 토큰/시크릿/민감한 페이로드 노출 금지
   - 에러 응답에 내부 스택/구성 노출 금지(사용자용 메시지로 제한)

6. 입력 검증 및 방어
   - 길이/포맷 검증, 화이트리스트 적용
   - ORM/DB 쿼리 시 파라미터 바인딩 및 SQL 인젝션 방지

7. 로깅감사
   - 업로드/삭제/다운로드/권한 변경 등 주요 동작에 대해 구조화된 감사 로그 생성
   - 로그 중앙집중 수집(예: ELK, Datadog) 및 보관/검색 정책 적용

## 권장 조치

- 서버측 권한 강제화(핵심, 필수)
- 파일 시그니처 검사 및 확장자/MIME 일치 여부 확인
- 업로드 크기 제한 및 확장자 필터링
- 감사 로그(구조화) 및 중앙 로그 적재
- Socket 인증 강화(토큰 만료/재발급 정책 포함)
- 업로드 rate limit 및 비정상 시도 차단

## 검증 스크립트 예시

다음은 로컬 환경에서 간단히 검증할 수 있는 PowerShell/curl 예시입니다.

```powershell
# 로그인 (예시)
curl -s -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d '{"email":"client@example.com","password":"password"}'

# 인증 없이 증거 목록 요청 (401 또는 적절한 에러가 반환되는지 확인)
curl -i -X GET http://localhost:5001/api/evidence
```

## 참고 파일

- `packages/backend/src/routes/evidence.ts`
- `packages/frontend/src/pages/AIEvidenceAnalysis.tsx`
- `packages/frontend/src/pages/EvidenceCreate.tsx`
- `packages/frontend/src/pages/EvidenceList.tsx`

---

작성자: 자동 점검 스크립트
생성일: 2025-11-27
