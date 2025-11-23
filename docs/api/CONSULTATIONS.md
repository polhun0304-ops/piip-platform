# Consultations API

본 문서는 상담(Consultation) 관련 REST 엔드포인트 초안을 설명합니다. 현재는 최소 기능 스켈레톤으로 배포되었으며, 인증은 JWT Bearer 토큰을 사용합니다.

## 엔티티 개요

- id (uuid)
- clientUserId (uuid)
- detectiveId (uuid, optional)
- caseId (uuid, optional)
- type: "free15" | "paid30"
- channel: "voice" | "video" (default: video)
- timezone: IANA TZ (default: UTC)
- scheduledAt: ISO datetime (optional)
- durationMinutes: number (default: 15 or 30)
- status: "proposed" | "scheduled" | "started" | "completed" | "canceled" | "no-show"
- legalAdviceDisclaimerAck (boolean)
- recordingConsent (boolean)
- privacyPolicyAck (boolean)
- meetingUrl, manageUrl, icsUrl (optional)
- cancelReason, summaryNote (optional)

## 인증

모든 엔드포인트는 Authorization: Bearer `JWT` 필요. 역할별 권한은 각 섹션에 표기.

---

## POST /api/consultations

상담 생성 (클라이언트/관리자)

Body 예시:

```json
{
  "type": "free15",
  "channel": "video",
  "timezone": "Asia/Seoul",
  "scheduledAt": null,
  "durationMinutes": 15,
  "caseId": null,
  "detectiveId": null,
  "legalAdviceDisclaimerAck": true,
  "recordingConsent": false,
  "privacyPolicyAck": true
}
```

- 기본 규칙: scheduledAt 존재 시 status = "scheduled", 없으면 "proposed"
- 응답: 생성된 Consultation 객체
- 권한: client, admin

---

## GET /api/consultations/:id

상담 단건 조회

- 권한: admin, 해당 상담의 client, 배정된 detective
- 응답: Consultation 객체

---

## PATCH /api/consultations/:id/schedule

상담 예약/재예약

Body 예시:

```json
{
  "scheduledAt": "2025-11-04T09:00:00.000Z",
  "timezone": "Asia/Seoul",
  "detectiveId": "<uuid>"
}
```

- 효과: scheduledAt 업데이트, status="scheduled"로 전환
- 권한: admin, 해당 client, detective
- 응답: 업데이트된 Consultation 객체

---

## PATCH /api/consultations/:id/status

상태 업데이트

Body 예시:

```json
{
  "status": "canceled",
  "cancelReason": "Client requested",
  "summaryNote": "요약 메모"
}
```

- 허용 상태: proposed, scheduled, started, completed, canceled, no-show
- 권한:
  - client: 본인 건에 대해 "canceled"만 가능
  - detective/admin: 제한 없음
- 응답: 업데이트된 Consultation 객체

---

## 향후 추가 예정

- 가용 시간 슬롯 계산 및 자동 배정
- 미팅 URL/ICS 생성, 알림(SMS/이메일) 발송
- 감사(Audit) 로그 및 상태 전이 제약 강화
- 배치/스케줄러를 통한 리마인더 및 노쇼 자동 처리

---

## GET /api/consultations

목록/검색 (페이지네이션/필터/정렬)

Query Params:

- page: 기본 1
- pageSize: 기본 20, 최대 100
- status: proposed|scheduled|started|completed|canceled|no-show
- type: free15|paid30
- sort: createdAt|scheduledAt (기본 createdAt)
- order: asc|desc (기본 desc)
- from: ISO datetime (기간 시작 - sort 기준 필드에 적용)
- to: ISO datetime (기간 종료 - sort 기준 필드에 적용)
- channel: voice|video
- caseId: uuid (admin 전용)
- detectiveId: uuid (admin 전용)
- clientUserId: uuid (admin 전용)

권한별 범위:

- admin: 전체 조회 + detectiveId/clientUserId/caseId 필터 사용 가능
- detective: 본인에게 배정된 상담만
- client: 본인 상담만

응답 예시:

```json
{
  "items": [{ "id": "...", "status": "scheduled", ... }],
  "page": 1,
  "pageSize": 20,
  "total": 42,
  "totalPages": 3
}
```
