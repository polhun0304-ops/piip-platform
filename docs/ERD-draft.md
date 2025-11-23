# PIIP ERD Draft (v0.1)

본 문서는 PIIP 플랫폼의 핵심 도메인 엔터티와 관계를 초기 초안으로 정리합니다. 실제 구현에서 세부 필드/인덱스/제약은 변경될 수 있습니다.

## 1. 핵심 엔터티

- User (사용자)
  - id (PK), email (UK), phone, password_hash, role(client|detective|admin), status(active|suspended|deleted)
  - profile: name, avatar_url, verified_at, last_login_at
  - security: two_factor_enabled, terms_agreed_at, privacy_agreed_at

- Detective (탐정 프로필)
  - id (PK), user_id (FK->User), specialties(jsonb), region, license_no, rating, availability

- ClientProfile (의뢰인 프로필)
  - id (PK), user_id (FK->User), organization, billing_info(json)

- Case (사건)
  - id (PK), code(UK), client_id (FK->User), assigned_detective_id (FK->User), status(enum), priority(enum)
  - title, description, created_at, updated_at, closed_at
  - finances: estimate_amount, final_amount, currency

- Evidence (증거)
  - id (PK), case_id (FK->Case), uploader_id(FK->User), type(enum: image|audio|video|document|other)
  - path/url, mime_type, size_bytes, checksum_sha256, tags(string[])
  - ocr_text(TEXT, nullable), extracted_meta(JSONB)
  - status(enum: pending|analyzing|approved|rejected)

- ChainLog (체인 오브 커스터디)
  - id (PK), evidence_id(FK->Evidence), actor_id(FK->User), action(enum: upload|view|download|transfer|lock|unlock|delete)
  - at, ip, user_agent, note

- Report (리포트)
  - id (PK), case_id(FK), author_id(FK->User), status(draft|in_review|approved|rejected), version(INT)
  - title, summary, body_rich (JSON - 블록형), attachments(JSON[])

- MessageThread / Message (메시지)
  - Thread: id, case_id, created_by
  - Message: id, thread_id, author_id, body, attachments[], visibility(client|detective|admin|private)

- PaymentIntent / Transaction (결제)
  - PaymentIntent: id, case_id, client_id, status(pending|authorized|captured|canceled|failed), amount
  - Transaction: id, intent_id, provider(stripe|tosspayments|paypal|escrow), status, receipt_url, meta

- Notification (알림)
  - id, user_id, type, payload(JSON), channel(email|sms|inapp|push), read_at

- AuditLog (감사로그)
  - id, actor_id, entity_type, entity_id, action, diff(JSON), at, ip

## 2. 관계 개요

- User 1..1 -> Detective | ClientProfile (역할에 따라 하나 존재)
- User 1..\* -> Case (client 측)
- User 1..\* -> Case (assigned_detective 측)
- Case 1..\* -> Evidence, Report, MessageThread, PaymentIntent
- Evidence 1..\* -> ChainLog
- PaymentIntent 1..\* -> Transaction

## 3. 상태 전이 (Case)

- DRAFT → REVIEW → ACTIVE → EVIDENCE_COLLECTION → REPORT_DRAFT → REPORT_REVIEW → CLOSED
- 예외: CANCELED / ON_HOLD

## 4. 인덱스/성능 전략(초안)

- Case(code), Case(status, assigned_detective_id), Evidence(case_id, status), Report(case_id, version DESC)
- Message(thread_id, created_at), Notification(user_id, read_at)
- 감사 로그(AuditLog) entity_type + entity_id + at composite index

## 5. 보안/프라이버시 주의점

- Evidence 파일: 객체 스토리지(S3 등) + presigned URL + 서버단 해시검증
- PII: 최소수집, 암호화(at-rest, in-transit), 접근제어(Role + Scope)
- 삭제: soft-delete + 보관정책(retention)

## 6. 확장(향후)

- Tag/Taxonomy 테이블로 증거/사건 분류 고도화
- SLA Policy 테이블 (타이머 기준, 알림 룰)
- AssignmentRule (자동 매칭 로직)
