# PIIP Platform DB 설계

## 핵심 테이블

### 사용자 (Users)
- id: UUID (PK)
- email: VARCHAR(255)
- password_hash: VARCHAR(255)
- role: ENUM('admin', 'detective', 'client')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 사건 (Cases)
- id: UUID (PK)
- title: VARCHAR(255)
- description: TEXT
- status: ENUM('open', 'in_progress', 'closed')
- priority: ENUM('low', 'medium', 'high')
- assigned_to: UUID (FK: Users)
- client_id: UUID (FK: Users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 인물 (Persons)
- id: UUID (PK)
- name: VARCHAR(255)
- birth_date: DATE
- contact_info: JSONB
- case_id: UUID (FK: Cases)
- relationship: VARCHAR(100)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 증거 (Evidence)
- id: UUID (PK)
- case_id: UUID (FK: Cases)
- type: ENUM('document', 'photo', 'video', 'audio', 'physical')
- title: VARCHAR(255)
- description: TEXT
- file_urls: JSONB[]
- metadata: JSONB
- collected_by: UUID (FK: Users)
- collected_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 활동 로그 (ActivityLogs)
- id: UUID (PK)
- case_id: UUID (FK: Cases)
- user_id: UUID (FK: Users)
- activity_type: VARCHAR(100)
- description: TEXT
- metadata: JSONB
- created_at: TIMESTAMP

### 결제 (Payments)
- id: UUID (PK)
- case_id: UUID (FK: Cases)
- client_id: UUID (FK: Users)
- amount: DECIMAL(10,2)
- status: ENUM('pending', 'completed', 'failed')
- payment_method: VARCHAR(50)
- transaction_id: VARCHAR(255)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

## 관계
- Users - Cases: 1:N (담당자)
- Users - Cases: 1:N (의뢰인)
- Cases - Persons: 1:N
- Cases - Evidence: 1:N
- Cases - ActivityLogs: 1:N
- Cases - Payments: 1:N
- Users - ActivityLogs: 1:N