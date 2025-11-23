# 상담 플로우 통합 완료 보고

## ✅ 완료된 작업

### 1. Intake 완료 후 상담 제안

- **파일**: `packages/backend/src/services/intakeAgent.ts`
- **통합 위치**: `processClientMessage()` 함수 내 Intake 완료 시점 (line ~177-203)
- **로직**:
  - Intake 세션이 `completed` 상태로 전환되고 Case가 생성된 직후 실행
  - `classifyCase()`를 호출하여 AI 카테고리 분류 및 신뢰도(0-100) 획득
  - 신뢰도를 0-1 스케일로 정규화
  - `proposeConsultationAfterIntake(caseId, aiConfidence, category)` 호출
- **트리거 조건**:
  - AI 신뢰도 < 0.6 (60%)
  - 민감 카테고리 (가정/이혼, 기업내부, 법적위험 등)
- **생성되는 상담**:
  - type: "free15"
  - status: "proposed"
  - caseId 연결
- **오류 처리**: 상담 제안 실패해도 Intake 완료는 정상 처리 (try-catch)

### 2. Quote 생성 후 상담 제안

- **파일**: `packages/backend/src/routes/quotes.ts`
- **통합 위치**: `POST /api/quotes` 엔드포인트 내 Quote 저장 직후 (line ~176-186)
- **로직**:
  - Quote 생성 및 DB 저장 완료 직후 실행
  - `proposeConsultationAfterQuote(quoteId)` 호출
  - Quote 엔티티에서 `finalPrice`를 읽어 고가 견적 여부 판단
- **트리거 조건**:
  - finalPrice >= 3,000,000원 (3백만원 이상 고가 견적)
- **생성되는 상담**:
  - type: "free15" 또는 "paid30" (심각도에 따라)
  - status: "proposed"
  - caseId 연결 (Quote의 caseId)
- **오류 처리**: 상담 제안 실패해도 Quote 생성은 정상 처리 (try-catch)

### 3. Payment 완료 후 킥오프 콜 제안

- **상태**: 미구현 (Payment 엔티티/라우트 부재)
- **준비 완료**: `proposeKickoffAfterPayment(caseId, clientUserId)` 함수는 준비됨
- **향후 작업**: Payment 라우트 구현 시 통합 필요

## 🔧 핵심 기술 구현

### Soft-Gating 평가 로직

- **파일**: `packages/backend/src/services/consultationGating.ts`
- **함수**: `evaluateSoftGating(criteria: SoftGatingCriteria)`
- **평가 기준**:
  | 조건 | 기준 | 심각도 |
  |------|------|--------|
  | AI 신뢰도 낮음 | confidence < 0.6 | high |
  | 민감 카테고리 | family, corporate, legal | medium |
  | 고가 견적 | finalPrice >= 3,000,000원 | medium |
  | 긴급/혼란 신호 | urgencyFlag, clientConfusionFlag | medium |
  | 관할/규제 플래그 | regulatoryFlag | high |

- **심각도 레벨**:
  - `low`: 권장하지 않음
  - `medium`: 배너/툴팁으로 권장
  - `high`: 모달로 강력 권장 (항상 "건너뛰고 계속" 옵션 제공)

### 중복 방지 메커니즘

- 동일 `caseId` + `status="proposed"` 상담이 이미 존재하면 새로 생성하지 않음
- DB 조회로 기존 proposed 상담 확인 후 중복 방지

### 데이터 흐름

```
Intake 완료
  ↓
classifyCase() → confidence (0-100)
  ↓
정규화 → aiConfidence (0-1)
  ↓
proposeConsultationAfterIntake()
  ↓
evaluateSoftGating() → {shouldRecommend, reasons, severity}
  ↓
Consultation 엔티티 생성 (status: "proposed")
```

```
Quote 생성
  ↓
proposeConsultationAfterQuote()
  ↓
Quote.finalPrice 확인
  ↓
evaluateSoftGating() → {shouldRecommend, reasons, severity}
  ↓
Consultation 엔티티 생성 (status: "proposed")
```

## 📝 다음 단계

### 즉시 필요

1. ~~IntakeSession에 `userId` 필드 추가~~ ✅ 이미 존재
2. ✅ Intake 완료 후 상담 제안 통합
3. ✅ Quote 생성 후 상담 제안 통합
4. ⏳ Payment 완료 후 킥오프 제안 통합 (Payment 구현 대기 중)

### 추후 작업

5. 프론트엔드 UI 컴포넌트
   - Intake 완료 페이지 배너/모달
   - Quote 확인 페이지 툴팁/배너
   - Payment 완료 페이지 킥오프 콜 CTA
6. 알림 및 캘린더 통합
   - ICS 파일 생성
   - 이메일/SMS 리마인더 (T-24h, T-2h)
   - 노쇼 감지 및 처리
   - 화상 회의 URL 생성 (Zoom/Google Meet)
7. 상담 관리 기능
   - 탐정 가용 시간 캘린더
   - 상담 재스케줄링
   - SLA 모니터링 (예: 첫 상담 제안 후 48h 내 스케줄)

## 🧪 검증 완료

- ✅ TypeScript 컴파일 성공 (`npm run build`)
- ✅ 엔티티 필드 정확성 (Quote.finalPrice, IntakeSession.userId)
- ✅ 오류 처리 (try-catch로 핵심 플로우 보호)
- ✅ 중복 생성 방지 로직

## 📚 참조 문서

- `docs/consultation/POLICY.md` - 소프트 게이팅 정책
- `docs/consultation/FLOW_INTEGRATION.md` - 연계 설계 문서
- `docs/api/CONSULTATIONS.md` - REST API 명세
