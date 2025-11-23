# PIIP 플랫폼 관리자 관리 시스템

## 구현된 기능 개요

이번 업데이트에서 완전한 **관리자 관리 시스템**을 구현했습니다. 관리자는 탐정, 사건, 배정, 가격, 견적 등을 전체적으로 관리할 수 있습니다.

---

## 🔐 인증 시스템

### 사용자 역할

- **admin**: 전체 시스템 관리자
- **detective**: 탐정 (사건 배정 및 처리)
- **client**: 의뢰인 (사건 생성 및 견적 승인)

### API 엔드포인트

#### 회원가입

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "detective",  // admin, detective, client 중 하나
  "name": "홍길동",      // 탐정인 경우 필수
  "phone": "010-1234-5678"
}
```

#### 로그인

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@piip.com",
  "password": "admin123!@#"
}

응답:
{
  "message": "로그인 성공",
  "user": {
    "id": "...",
    "email": "admin@piip.com",
    "role": "admin",
    "isActive": true,
    "detectiveId": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 현재 사용자 정보

```
GET /api/auth/me
Authorization: Bearer {token}
```

#### 비밀번호 변경

```
PUT /api/auth/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "old123",
  "newPassword": "new123"
}
```

---

## 💰 가격 관리 시스템

관리자는 가격 템플릿을 생성하고 관리할 수 있습니다.

### API 엔드포인트

#### 가격 템플릿 목록 조회

```
GET /api/pricing
GET /api/pricing?category=불륜조사
GET /api/pricing?isActive=true
```

#### 가격 템플릿 생성 (관리자 전용)

```
POST /api/pricing
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "category": "불륜조사",
  "name": "기본 불륜조사 패키지",
  "basePrice": 5000000,
  "priceUnit": "per_case",
  "estimatedDays": 14,
  "options": [
    {
      "key": "GPS_TRACKING",
      "label": "GPS 추적 장치",
      "price": 500000,
      "priceType": "fixed"
    },
    {
      "key": "NIGHT_SURVEILLANCE",
      "label": "야간 감시",
      "price": 20,
      "priceType": "percentage"
    }
  ],
  "includedServices": ["기본 감시", "사진 촬영", "보고서 작성"],
  "isActive": true,
  "sortOrder": 1
}
```

#### 가격 템플릿 수정/삭제 (관리자 전용)

```
PUT /api/pricing/:id
DELETE /api/pricing/:id
PATCH /api/pricing/:id/activate
```

---

## 📋 견적 관리 시스템

견적은 draft → sent → approved/rejected 워크플로우를 따릅니다.

### API 엔드포인트

#### 견적 생성 (관리자 전용)

```
POST /api/quotes
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "caseId": "사건 ID",
  "pricingTemplateId": "가격 템플릿 ID",
  "selectedOptions": ["GPS_TRACKING", "NIGHT_SURVEILLANCE"],
  "discount": 500000,
  "notes": "특별 할인 적용",
  "validUntil": "2024-12-31T23:59:59Z"
}
```

#### 견적 발송 (관리자 전용)

```
POST /api/quotes/:id/send
Authorization: Bearer {admin-token}
```

#### 견적 승인 (의뢰인)

```
POST /api/quotes/:id/approve
Authorization: Bearer {client-token}
```

#### 견적 거부 (의뢰인)

```
POST /api/quotes/:id/reject
Authorization: Bearer {client-token}
Content-Type: application/json

{
  "rejectionReason": "가격이 예산을 초과합니다."
}
```

---

## 🕵️ 탐정 관리 (관리자 기능 강화)

### 기존 기능

- GET /api/detectives - 탐정 목록
- GET /api/detectives/:id - 탐정 상세
- POST /api/detectives - 탐정 등록
- PUT /api/detectives/:id - 탐정 정보 수정

### 새로운 관리자 기능

#### 탐정 삭제 (관리자 전용)

```
DELETE /api/detectives/:id
Authorization: Bearer {admin-token}
```

- 현재 담당 사건이 0개일 때만 삭제 가능
- 활성 사건이 있으면 삭제 불가

#### 탐정 활성화/비활성화 (관리자 전용)

```
PATCH /api/detectives/:id/activate
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "isActive": true  // 또는 false
}
```

---

## 📁 사건 관리 (관리자 기능 강화)

### 역할별 접근 제어

- **탐정**: 자신에게 배정된 사건만 조회 가능
- **관리자**: 모든 사건 조회 및 관리 가능

### 새로운 관리자 기능

#### 사건 상태 변경 (관리자 전용)

```
PATCH /api/cases/:id/status
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "조사중"
  // 가능한 상태: 대기, 배정됨, 조사중, 보고서작성, 완료, 보류, 취소
}
```

#### 사건 우선순위 설정 (관리자 전용)

```
PATCH /api/cases/:id/priority
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "priority": "긴급"
  // 가능한 우선순위: 긴급, 높음, 보통, 낮음
}
```

#### 사건 재배정 (관리자 전용)

```
POST /api/cases/:id/reassign
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "newDetectiveId": "새 탐정 ID",
  "reason": "기존 탐정 휴가로 인한 재배정"
}
```

- 기존 배정은 '취소됨' 상태로 변경
- 새로운 배정 생성

---

## 🔄 배정 관리 (관리자 기능 강화)

### 역할별 접근 제어

- **탐정**: 자신의 배정만 조회 가능
- **관리자**: 모든 배정 조회 및 관리 가능

### 새로운 관리자 기능

#### 배정 취소 (관리자 전용)

```
DELETE /api/assignments/:id
Authorization: Bearer {admin-token}
```

- 배정 상태를 '취소됨'으로 변경
- 탐정의 currentCaseCount 감소

#### 배정 우선순위 설정 (관리자 전용)

```
PATCH /api/assignments/:id/priority
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "priority": "긴급"
}
```

---

## 📊 대시보드 및 통계

### 관리자 대시보드

```
GET /api/dashboard/admin
Authorization: Bearer {admin-token}
```

**응답 예시:**

```json
{
  "cases": {
    "total": 150,
    "byStatus": {
      "대기": 10,
      "배정됨": 20,
      "조사중": 50,
      "완료": 70
    }
  },
  "detectives": {
    "total": 25,
    "active": 20,
    "avgUtilization": 65.5,
    "topPerformers": [
      {
        "id": "...",
        "name": "홍길동",
        "rating": 4.8,
        "successRate": 92,
        "completedCases": 45
      }
    ]
  },
  "assignments": {
    "total": 200,
    "byStatus": {
      "대기중": 15,
      "수락됨": 80,
      "거부됨": 5,
      "완료됨": 100
    },
    "avgAssignmentDays": 12.5
  },
  "revenue": {
    "totalQuotes": 180,
    "approvedQuotes": 120,
    "totalRevenue": 450000000
  }
}
```

### 탐정 대시보드

```
GET /api/dashboard/detective/:detectiveId
Authorization: Bearer {detective-token}
```

**응답 예시:**

```json
{
  "detective": {
    "id": "...",
    "name": "홍길동",
    "rating": 4.8,
    "successRate": 92,
    "currentCaseCount": 3,
    "maxConcurrentCases": 5,
    "utilization": 60
  },
  "assignments": {
    "total": 50,
    "accepted": 45,
    "rejected": 5,
    "completed": 40,
    "acceptanceRate": 90
  },
  "activeCases": [...],
  "recentCompleted": [...],
  "monthlyPerformance": [
    {
      "month": "2024-06",
      "cases": 8,
      "completed": 7,
      "avgRating": 4.7
    }
  ]
}
```

### 트렌드 분석 (관리자 전용)

```
GET /api/dashboard/trends
Authorization: Bearer {admin-token}
```

**응답 예시:**

```json
{
  "monthlyCases": [
    { "month": "2024-01", "total": 12, "completed": 10 },
    { "month": "2024-02", "total": 15, "completed": 13 }
  ],
  "casesByCategory": [
    { "category": "불륜조사", "count": 45 },
    { "category": "소재파악", "count": 30 }
  ],
  "assignmentTrends": [
    {
      "month": "2024-01",
      "totalAssignments": 20,
      "acceptedAssignments": 18,
      "acceptanceRate": 90
    }
  ]
}
```

---

## 🔧 템플릿 관리 (관리자 전용)

의뢰 템플릿 CRUD API

```
GET /api/templates
GET /api/templates/:id
POST /api/templates (관리자 전용)
PUT /api/templates/:id (관리자 전용)
DELETE /api/templates/:id (관리자 전용)
PATCH /api/templates/:id/activate (관리자 전용)
```

---

## 🚀 서버 시작 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일에 다음 설정이 추가되었습니다:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@piip.com
ADMIN_PASSWORD=admin123!@#
```

### 3. 서버 시작

```bash
npm run dev
```

서버 시작 시 자동으로:

- 데이터베이스 초기화
- 기본 관리자 계정 생성 (admin@piip.com / admin123!@#)
- 샘플 템플릿 및 탐정 데이터 시드

### 4. 관리자로 로그인 테스트

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@piip.com","password":"admin123!@#"}'
```

---

## 🔒 보안 주의사항

1. **프로덕션 환경에서 반드시 변경해야 할 것들:**
   - JWT_SECRET: 강력한 랜덤 문자열로 변경
   - ADMIN_PASSWORD: 초기 로그인 후 즉시 변경
   - 환경 변수를 .env 파일이 아닌 안전한 환경 변수 관리 시스템 사용

2. **인증 토큰 사용:**
   - 모든 보호된 엔드포인트는 `Authorization: Bearer {token}` 헤더 필요
   - 토큰은 7일 후 만료 (JWT_EXPIRES_IN 설정으로 변경 가능)

3. **역할 기반 접근 제어:**
   - 관리자만 수정/삭제 가능
   - 탐정은 자신의 데이터만 조회 가능
   - 의뢰인은 견적 승인/거부만 가능

---

## 📝 다음 단계 권장사항

1. **프론트엔드 개발:**
   - 관리자 대시보드 UI
   - 탐정 대시보드 UI
   - 의뢰인 견적 승인 UI

2. **알림 시스템:**
   - 견적 발송 시 이메일 알림
   - 배정 시 탐정에게 푸시 알림
   - 사건 상태 변경 시 의뢰인에게 알림

3. **보고서 기능:**
   - PDF 보고서 생성
   - 월간/분기별 통계 리포트
   - 수익 분석 리포트

4. **고급 기능:**
   - 사건 자동 배정 알고리즘 개선
   - AI 기반 가격 추천
   - 탐정 성과 평가 자동화
