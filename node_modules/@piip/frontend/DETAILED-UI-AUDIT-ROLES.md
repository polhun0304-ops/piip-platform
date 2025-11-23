# UI Audit — 역할별(의뢰인/탐정/관리자) 현황 및 권장 수정

작성일: 2025-11-22

이 문서는 `packages/frontend` 코드베이스를 검사하여 의뢰인(client), 탐정(detective), 관리자(admin) 관점에서 현재 제공되는 화면을 정리하고, 부족한 부분, 중복/병합 후보, 우선순위 개선 작업을 권장합니다. 또한 소규모 공통 컴포넌트를 추가해 반복을 줄이는 수정을 적용했습니다(`RolePill`).

요약(빠르게)

- 주요 화면은 대부분 존재: 케이스 목록(`CaseList`), 케이스 상세(`CaseDetail`), 보안 채팅(`SecureChat`), 역할별 대시보드(`ClientDashboard`, `DetectiveDashboard`, `AdminDashboard`).
- 다만 중복/유사 컴포넌트(여러 HomePage 변형, 여러 대시보드 라우트 지정)와 역할별 UX 차이 미흡, 권한 기반 접근 제어(프론트 라우트 가드)와 일부 핵심 흐름(의뢰인 → 케이스 생성 후 결제/상담 예약, 탐정이 수락/거절/일정 관리, 관리자 통계·권한 관리)의 일부가 아직 미비합니다.
- 적용 완료: `RolePill`(공통 역할 표시 Avatar+라벨) 추가, `SecureChat`가 이를 사용하도록 리팩터.

1. 코드베이스에서 찾은 주요 관련 페이지

- 인증/가입/로그인
  - `src/pages/LoginPage.tsx`, `src/pages/SignUpPage.tsx`

- 홈 / 랜딩
  - 여러 버전 존재: `HomePage.tsx`, `EnhancedHomePage.tsx`, `HomeModern.tsx`, `LegacyHomePage.tsx`, `Port3000HomePage.tsx`, `HomeSelector.tsx`
  - 권장: 단일 유지판(EnhancedHomePage 또는 HomeModern)을 기본으로 두고 나머지는 보통 제거/통합

- 대시보드(역할별)
  - `src/pages/ClientDashboard.tsx` — 의뢰인 전용 뷰
  - `src/pages/DetectiveDashboard.tsx` — 탐정 전용 뷰
  - `src/pages/AdminDashboard.tsx` — 관리자 전용 뷰 (및 `AdminDbPage.tsx`)
  - 라우트 진입부: `src/pages/Dashboard.tsx`가 role에 따라 리다이렉트

- 케이스
  - 리스트: `src/pages/CaseList.tsx`
  - 상세: `src/pages/CaseDetail.tsx` (여기서 `SecureChat` 포함)
  - 생성 폼: `src/pages/CaseCreateForm.tsx`

- 채팅/실시간
  - `src/components/SecureChat.tsx` (E2EE 로직 포함)
  - 테스트용 socket scripts: `test/socket-test.js`, `test/e2ee-headless.js`

2. 역할별 요구 기능 점검 (현재 구현·미구현)

A. 의뢰인(Client)

- 필수 흐름 검토:
  1.  계정 생성/로그인 — 구현됨 (`SignUpPage`, `LoginPage`).
  2.  케이스 생성(입력 폼, 증거 업로드) — `CaseCreateForm` 존재; 증거 업로드 UI가 상세히 구현되어 있는지 확인 필요(파일 업로드/프로그레스/미리보기).
  3.  결제/견적 요청 — 결제 처리 관련 컴포넌트/엔드포인트 호출 코드가 눈에 잘 띄지 않음(백엔드에 연동 필요). 미구현/누락 가능성이 큼.
  4.  케이스 상태/대시보드 — `ClientDashboard` 제공. 목록 필터(진행중/완료), 대시보드 카드의 액션(메시지, 예약 재조정 등) UX 강화 필요.
  5.  채팅/실시간 — `SecureChat` 포함된 `CaseDetail`에서 접근 가능. E2EE 기능은 구현되어 있어 보안 관점 양호.

- 권장 보강 (우선순위)
  - 결제/결재 흐름 컴포넌트(결제 상태, 인보이스, 결제 수단 등록) 추가
  - 파일 업로드(증거) UX 개선: 드래그앤드롭, 업로드 큐, 바이너리 저장 진행률
  - 케이스 생성 성공 후의 후속 흐름(알림, 상담 일정 예약) 명확화

B. 탐정(Detective)

- 필수 흐름 검토:
  1.  가입/프로필(경력/신원) — 탐정 등록 흐름 존재하지만 프로필 심사 UI/관리자 승인 프로세스가 필요함
  2.  케이스 수주/수락 — `DetectiveDashboard`에 액션(UI 버튼)은 있음. 서버 사이드 작업(수락/거절 API)이 있어야 함.
  3.  일정 관리/캘린더 — `DetectiveCalendar` 컴포넌트가 존재(참조되는 페이지들). 캘린더와 예약 연동 점검 필요.
  4.  채팅 — `SecureChat`로 사용 가능.

- 권장 보강
  - 탐정 전용 작업 큐(할당, 우선순위 표시), 배지/알림
  - 프로필 심사/포트폴리오 업로드, 관리자 승인 플로우

C. 관리자(Admin)

- 필수 흐름 검토:
  1.  사용자/데이터 관리 — `AdminDbPage` 존재 (탐정/클라이언트/케이스/설정 탭)
  2.  통계/대시보드 — `AdminDashboard` 및 `HomePage`의 admin stats 사용
  3.  권한·승인 — 관리자 UI에서 탐정 승인, 케이스 강제 중단 등 작업 필요

- 권장 보강
  - 운영 알림(이상 거래, 에러 트래킹), 감사 로그 뷰
  - 관리자 역할별 액션(승인/거절 기록), 롤백/상태 변경 이력

3. 중복/병합 후보

- 여러 HomePage 구현
  - `HomePage`, `EnhancedHomePage`, `HomeModern`, `LegacyHomePage`, `Port3000HomePage` 등. 이들 중 1~2개를 선택해 유지하고 나머지는 제거 또는 통합(리팩터) 권장.

- 중복 라우트/경로
  - `App.tsx`에 동일한 컴포넌트가 여러 곳에 import/등록된 흔적(아마 리팩터 중 중복 남음). 라우트 정리 필요.

- 역할 표시/색상 매핑 반복
  - 여러 파일에 역할→라벨/색상 매핑 로직이 반복됨(예: `SecureChat`). 이미 공통 컴포넌트 `RolePill`을 추가해 반복을 줄였습니다. 유사한 패턴이 있으면 교체 권장.

4. 보안·권한·접근성 점검(프론트엔드 관점)

- 권한(라우트 가드): `Dashboard.tsx`가 역할 기반으로 리다이렉트는 하지만, 라우트 수준에서 보호되어 있는지(예: 로그인/토큰 검사 후 접근 제한) 확인 필요.
- 민감 데이터 노출: E2EE는 클라이언트 중심으로 구현되어 있어 서버에 평문 저장이 되지 않도록 설계됨(좋음). 그러나 메시지 미복호화 시 UI 처리(placeholder / '암호화된 메시지')를 확실히 해야 함.
- 접근성: 주요 컴포넌트(채팅 입력, 버튼)에 키보드 액세스 및 ARIA 속성 추가 권장.

5. 적용한 소규모 수정(완료)

- `src/components/RolePill.tsx` 추가 — 역할 라벨/색상/아바타를 캡슐화
- `src/components/SecureChat.tsx`에서 RolePill 사용하도록 리팩터 (중복 로직 제거)

6. 권장 다음 단계(단계별 PR)

7. (이미 수행) 공통 컴포넌트: `RolePill` 추가 — PR에 포함됨

8. 라우트·홈페이지 정리 PR

- 작업: 중복된 홈 페이지 파일을 검토해 하나(또는 A/B 구현으로 유지할 이유)만 남기고 나머지 정리. `App.tsx` 라우트 중복 제거.
- 리스크: 시각/콘텐츠 차이로 인해 검토 필요

2. 권한(라우트 가드) 강화 PR

- 작업: 로그인/권한 상태에 따른 라우트 보호(ProtectedRoute 컴포넌트 도입), 관리자/탐정/의뢰인 전용 라우트로 분리

3. 클라이언트 결제/견적 플로우 추가 PR

- 작업: 케이스 생성 후 결제/인보이스 플로우, 상태 표시, 결제 수단 저장

4. 탐정 작업대시보드 개선 PR

- 작업: 작업 큐, 예약 캘린더 통합, 수락/거부 액션 개선

5. 파일 업로드 UX 개선 PR

- 작업: 증거 업로드 드래그/프로그레스/미리보기, 업로드 실패/재시도

6. 채팅 개선 PR

- 작업: `useMessages`에 mutation(전송 시 낙관적 업데이트), 소켓 이벤트 배치(collect-and-flush), 메시지 로딩/에러 UX

7. 접근성·테스트 PR

- 작업: keyboard navigation, ARIA, unit/integ tests for SecureChat and Case flows

7. CI/QA

- PR은 작게 나누어 CI에서 `build` + `test:e2e`를 실행해 검증

끝.

**_ 변경 사항(요약) _**

- 추가: `src/components/RolePill.tsx` (공통)
- 수정: `src/components/SecureChat.tsx` (RolePill 적용)

위 권장 항목 중에서 어떤 것을 먼저 적용할지 알려주시면, 그 항목을 우선으로 작은 PR(또는 패치)을 만들어 드리겠습니다. 또한 더 구체적으로 '의뢰인 화면에서 결제가 바로 보이도록' 같은 상세 요구가 있으면 바로 반영하겠습니다.
