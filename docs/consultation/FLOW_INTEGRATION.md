# 기존 플로우 연계 설계 문서

본 문서는 Intake, Quote, Payment 완료 시점에서 상담(Consultation) 제안 로직의 연계 방식을 정의합니다.

## 1. 소프트 게이팅(Soft-Gating) 조건

다음 조건에서 상담을 **강력 권장**하되, 여전히 선택사항입니다:

### 평가 기준

| 조건             | 기준                             | 심각도 |
| ---------------- | -------------------------------- | ------ |
| AI 신뢰도 낮음   | confidence < 0.6                 | high   |
| 민감 카테고리    | 가정/이혼, 기업내부, 법적위험 등 | medium |
| 고가 견적        | finalPrice >= 3,000,000원        | medium |
| 긴급/혼란 신호   | urgencyFlag, clientConfusionFlag | medium |
| 관할/규제 플래그 | regulatoryFlag                   | high   |

### 심각도(Severity) 레벨

- **low**: 권장하지 않음
- **medium**: 배너/툴팁으로 권장
- **high**: 모달로 강력 권장 (항상 "건너뛰고 계속" 옵션 제공)

## 2. 연계 시점 및 트리거

### 2.1 Intake 완료 후

**트리거**: `IntakeSession.status = "completed"`

**로직**:

```typescript
proposeConsultationAfterIntake(caseId, aiConfidence, category);
```

**조건**:

- AI 신뢰도 < 0.6
- 민감 카테고리 감지

**생성 상담**:

- type: "free15"
- status: "proposed"
- caseId: 연결

**UI 노출**:

- Intake 완료 페이지에서 배너/모달 표시
- "15분 무료 상담으로 정확도를 높이시겠습니까?"
- CTA: "상담 예약" / "나중에" / "건너뛰고 계속"

### 2.2 Quote 생성/업데이트 후

**트리거**: Quote 생성 또는 `finalPrice` 업데이트

**로직**:

```typescript
proposeConsultationAfterQuote(quoteId);
```

**조건**:

- finalPrice >= 3,000,000원 (고가 견적)

**생성 상담**:

- type: "free15" 또는 "paid30" (심각도에 따라)
- status: "proposed"
- caseId: Quote.caseId 연결

**UI 노출**:

- 견적서 확인 페이지에서 툴팁 또는 배너
- "고가 견적입니다. 결정 전 30분 딥다이브 상담을 권장합니다."
- CTA: "상담 예약" / "바로 진행"

### 2.3 결제 완료 후 (킥오프 콜)

**트리거**: Payment.status = "completed"

**로직**:

```typescript
proposeKickoffAfterPayment(caseId, clientUserId);
```

**조건**:

- 항상 제안 (선택형)

**생성 상담**:

- type: "free15"
- status: "proposed"
- 목적: 프로젝트 킥오프, 기대치 정렬

**UI 노출**:

- 결제 완료 페이지에서 "15분 킥오프 콜 예약" 옵션
- CTA: "킥오프 콜 예약" / "건너뛰기"

## 3. 중복 방지 규칙

- 동일 caseId + status="proposed" 상담이 이미 존재하면 새로 생성하지 않음
- 클라이언트가 "건너뛰고 계속"을 선택한 경우 세션에 기록하여 같은 시점에서 재노출하지 않음

## 4. 상태 전이 규칙

```
proposed → scheduled (클라이언트가 예약)
proposed → canceled (클라이언트가 거부/건너뛰기)
scheduled → started (상담 시작)
started → completed (정상 종료)
started → no-show (노쇼)
scheduled → canceled (24h 전 취소)
```

## 5. 구현 체크리스트

- [x] `services/consultationGating.ts` 생성
  - [x] `evaluateSoftGating()` - 조건 평가
  - [x] `proposeConsultationAfterIntake()` - Intake 후 제안
  - [x] `proposeConsultationAfterQuote()` - Quote 후 제안
  - [x] `proposeKickoffAfterPayment()` - 결제 후 킥오프 제안
- [ ] IntakeSession에 userId 필드 추가 또는 관계 연결
- [ ] Intake 완료 핸들러에 상담 제안 로직 통합
- [ ] Quote 생성/업데이트 핸들러에 상담 제안 로직 통합
- [ ] Payment 완료 핸들러에 킥오프 제안 로직 통합
- [ ] 프론트엔드 UI 컴포넌트 (배너/모달/CTA)

## 6. 향후 개선

- 클라이언트 혼란 감지: NLP 분석으로 urgencyFlag, confusionFlag 자동 탐지
- 관할/규제 플래그: 지역별 법규 DB와 연동
- A/B 테스트: 소프트 게이팅 문구 및 CTA 최적화
- 상담 전환율 추적: proposed → scheduled → completed 퍼널 분석
