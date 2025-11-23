# PIIP Detective Platform - 실제 연동 작업 목록

## 📌 개요

이 문서는 PIIP Detective Platform의 실제 서비스 운영 및 마케팅을 위해 필요한 연동 작업 목록입니다.
각 항목은 `app.js` 파일의 "추후 실제 연동 대기 영역" 주석과 매칭됩니다.

---

## 1️⃣ 이벤트/프로모션 연동 (사건접수 섹션)

### 목표

- 신규 고객 유치 및 프로모션 참여 유도
- 무료 상담, 할인 쿠폰, 경품 이벤트 등

### 구현 항목

- [ ] 이벤트 상세 페이지 또는 모달 구현
- [ ] 쿠폰 발급 API 연동
- [ ] 경품 응모 폼 및 서버 저장
- [ ] 이벤트 참여 현황 대시보드

### 기술 스택

- Frontend: 모달/페이지 라우팅
- Backend: 쿠폰 생성/검증 API, 이벤트 참여 DB
- 예시: `POST /api/events/participate { userId, eventId, couponCode }`

---

## 2️⃣ 실시간 상담 연동 (모니터링 섹션)

### 목표

- 사건 진행 중 실시간 문의 지원
- 채팅 및 전화 상담 즉시 연결

### 구현 항목

- [ ] 카카오톡 채팅/채널톡/라이브챗 SDK 연동
- [ ] Click-to-Call API 또는 콜센터 시스템 연동
- [ ] 챗봇(AI 자동 응답) 구현
- [ ] 상담 이력 저장 및 조회

### 기술 스택

- 카카오톡: Kakao SDK (https://developers.kakao.com)
- 라이브챗: LiveChat, Intercom, Drift 등
- 전화: Twilio, Plivo, CallRail API
- 예시: `Kakao.Link.sendDefault({ ... })` 또는 `window.open('tel:1577-0000')`

---

## 3️⃣ SNS 공유 연동 (검색 섹션)

### 목표

- 사건 접수/진행/성공 사례 바이럴 마케팅
- 카카오톡, 네이버, 페이스북, 트위터 공유

### 구현 항목

- [ ] 카카오톡 공유 (Kakao SDK)
- [ ] 네이버 블로그/카페 공유
- [ ] 페이스북/트위터 공유 버튼
- [ ] 공유 클릭 수 추적 (UTM 파라미터)

### 기술 스택

- 카카오톡: `Kakao.Link.sendDefault`, `Kakao.Story.share`
- 페이스북: Facebook Share Dialog
- 트위터: Twitter Web Intent
- 예시:
  ```javascript
  Kakao.Link.sendDefault({
    objectType: "feed",
    content: {
      title: "PIIP Detective - 사건 해결",
      description: "빠르고 안전한 탐정 플랫폼",
      imageUrl: "https://piip.example/og-image.jpg",
      link: {
        mobileWebUrl: "https://piip.example",
        webUrl: "https://piip.example",
      },
    },
  });
  ```

---

## 4️⃣ 후기/평점 연동 (체크리스트 섹션)

### 목표

- 실제 이용자 후기 및 평점 수집
- 서비스 신뢰도 향상 및 마케팅 자료 확보

### 구현 항목

- [ ] 후기 작성 폼/모달 구현
- [ ] 별점(Rating) 컴포넌트
- [ ] 후기 서버 저장 및 승인 프로세스
- [ ] 후기 목록 페이지 및 필터링

### 기술 스택

- Frontend: 별점 UI (react-rating, star-rating 등)
- Backend: 후기 CRUD API (`POST /api/reviews`, `GET /api/reviews`)
- 예시:
  ```javascript
  fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId, rating: 5, comment: "최고의 서비스!" }),
  });
  ```

---

## 5️⃣ 사건별 알림 시스템

### 목표

- 사건 진행 단계별 자동 알림 발송
- 접수, 진행, 완료 등 주요 이벤트 알림

### 구현 항목

- [ ] 웹 푸시 알림 (Web Push API)
- [ ] 이메일 알림 (SendGrid, Mailgun, AWS SES 등)
- [ ] SMS 알림 (Twilio, Aligo, NHN Cloud 등)
- [ ] 사용자 알림 설정 페이지

### 기술 스택

- 웹 푸시: Service Worker + Push API
- 이메일: SMTP/API 연동
- SMS: SMS API 연동
- 예시:
  ```javascript
  navigator.serviceWorker.ready.then((registration) => {
    registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: "...",
      })
      .then((subscription) => {
        fetch("/api/push/subscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
        });
      });
  });
  ```

---

## 6️⃣ 진행 단계별 자동화

### 목표

- AI 분석 → 전문가 배정 → 증거 수집 → 리포트 생성 자동화
- 사건 관리 효율성 극대화

### 구현 항목

- [ ] AI 분석 완료 시 자동 전문가 매칭 로직
- [ ] 증거 수집 완료 시 자동 리포트 생성 트리거
- [ ] 각 단계별 워크플로우 엔진 구현
- [ ] 자동화 실패 시 알림 및 수동 개입 UI

### 기술 스택

- Backend: 워크플로우 엔진 (Temporal, Airflow, Camunda 등)
- AI: 자동 분석 및 매칭 알고리즘
- 예시:
  ```javascript
  fetch("/api/case/auto-assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId, step: "ai-analysis-complete" }),
  });
  ```

---

## 7️⃣ 전문가/의뢰자별 맞춤 안내

### 목표

- 사용자 역할(의뢰자/전문가/관리자)에 따라 맞춤 대시보드 제공
- 역할별 체크리스트, 진행 상황, 필요 서류 안내

### 구현 항목

- [ ] 사용자 역할 관리 시스템 (RBAC)
- [ ] 의뢰자 대시보드 (사건 진행 상황, 필요 서류)
- [ ] 전문가 대시보드 (배정 사건, 증거 요청, 리포트 작성)
- [ ] 관리자 대시보드 (전체 현황, 품질 관리, 알림 설정)

### 기술 스택

- Frontend: 역할별 라우팅/컴포넌트 분기
- Backend: RBAC API (`GET /api/user/role`, `GET /api/dashboard/:role`)
- 예시:
  ```javascript
  const userRole = await fetch("/api/user/role").then((r) => r.json());
  if (userRole === "client") {
    showClientDashboard();
  } else if (userRole === "expert") {
    showExpertDashboard();
  } else if (userRole === "admin") {
    showAdminDashboard();
  }
  ```

---

## 🚀 우선순위 및 로드맵

### Phase 1 (즉시 실행)

1. 실시간 상담 연동 (채팅/전화)
2. 사건별 알림 시스템 (이메일/SMS)

### Phase 2 (1-2개월 이내)

3. 후기/평점 시스템
4. 이벤트/프로모션 연동

### Phase 3 (3-6개월 이내)

5. SNS 공유 연동
6. 진행 단계별 자동화
7. 전문가/의뢰자별 맞춤 안내

---

## 📝 참고사항

- 모든 API 연동은 보안(HTTPS, 인증/인가)을 필수로 적용
- 개인정보 처리는 GDPR, 개인정보보호법 준수
- 각 기능은 점진적으로 도입하며 A/B 테스트 실시
- 실제 서비스 운영 시 `app.js`의 TODO 주석을 참고하여 구현

---

**작성일**: 2025년 11월 7일
**버전**: 1.0
**담당**: PIIP Detective Platform 개발팀
