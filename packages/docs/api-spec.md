# PIIP Platform API 명세

## 인증 API

### POST /api/auth/register
새 사용자 등록
```json
{
  "email": "string",
  "password": "string",
  "role": "detective|client"
}
```

### POST /api/auth/login
로그인
```json
{
  "email": "string",
  "password": "string"
}
```

## 사건 API

### GET /api/cases
사건 목록 조회
```json
{
  "status": "string?",
  "assignedTo": "uuid?",
  "clientId": "uuid?",
  "page": "number",
  "limit": "number"
}
```

### POST /api/cases
새 사건 생성
```json
{
  "title": "string",
  "description": "string",
  "priority": "low|medium|high",
  "clientId": "uuid"
}
```

### GET /api/cases/:id
사건 상세 조회

### PUT /api/cases/:id
사건 정보 수정
```json
{
  "title": "string?",
  "description": "string?",
  "status": "string?",
  "priority": "string?"
}
```

## 인물 API

### GET /api/persons
인물 목록 조회
```json
{
  "caseId": "uuid?",
  "name": "string?",
  "page": "number",
  "limit": "number"
}
```

### POST /api/persons
새 인물 정보 등록
```json
{
  "name": "string",
  "birthDate": "date?",
  "contactInfo": "object?",
  "caseId": "uuid",
  "relationship": "string?",
  "notes": "string?"
}
```

## 증거 API

### GET /api/evidence
증거 목록 조회
```json
{
  "caseId": "uuid?",
  "type": "string?",
  "page": "number",
  "limit": "number"
}
```

### POST /api/evidence
새 증거 등록
```json
{
  "caseId": "uuid",
  "type": "document|photo|video|audio|physical",
  "title": "string",
  "description": "string?",
  "fileUrls": "string[]",
  "metadata": "object?"
}
```

## 결제 API

### GET /api/payments
결제 목록 조회
```json
{
  "caseId": "uuid?",
  "status": "string?",
  "page": "number",
  "limit": "number"
}
```

### POST /api/payments
새 결제 생성
```json
{
  "caseId": "uuid",
  "amount": "number",
  "paymentMethod": "string"
}
```

## WebSocket 이벤트

### case.update
사건 정보 업데이트 알림
```json
{
  "caseId": "uuid",
  "updateType": "string",
  "data": "object"
}
```

### evidence.added
새 증거 추가 알림
```json
{
  "caseId": "uuid",
  "evidenceId": "uuid",
  "type": "string"
}
```