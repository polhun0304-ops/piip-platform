# Detective Report Editor UI (v0.1)

탐정 리포트 작성 화면의 구성 요소, 상태, 인터랙션, 권한 제어, 버전 관리, 성능/보안 고려사항을 정의합니다.

## 1. 화면 목적

- 증거 기반의 구조화된 사실관계/분석/결론 리포트를 효율적으로 작성하고, QA/승인 워크플로와 연동한다.

## 2. 정보 구조(레이아웃)

- Header Bar
  - 사건 코드, 현재 상태 Badge(SLA Timer 포함), 저장/제출 버튼, 버전 스위처
- Left: 아웃라인 네비게이터(섹션 트리)
  - 섹션: 1) 요약 2) 사건 개요 3) 사실관계 4) 분석 5) 결론/권고 6) 부록
  - 드래그로 순서 변경, 섹션별 완료 체크
- Center: 리치 에디터(블록 기반, Markdown/Slate/TipTap 등)
  - 컴포넌트 블록: 텍스트, 표, 인용, 경고 Callout, 이미지, 증거 참조 카드
  - 자동 저장(초기 3s debounce, 이후 10s), 충돌 방지(서버 버저닝)
- Right: Evidence/Assets 패널
  - 증거 목록(필터: 타입/태그/상태), 썸네일, 무결성 해시, 체인 로그
  - 드래그&드롭으로 본문에 삽입(참조 링크 생성)

## 3. 핵심 인터랙션

- 증거 참조 삽입
  - 본문에 카드 블록으로 삽입 → 클릭 시 증거 사이드패널 오픈
  - 툴팁: 파일 메타, 업로드자, 해시, 체인 로그 빠른 보기
- 인용/각주
  - [1] 각주 자동 번호, 본문-각주 상호 이동
- 템플릿/스니펫
  - 사건유형별 템플릿 선택, 자주 쓰는 문구 스니펫 저장/검색/삽입
- 검토 코멘트
  - 특정 영역 드래그 → 코멘트 앵커 → 사이드패널 스레드(해결/재오픈)

## 4. 상태 및 워크플로

- 상태: draft → in_review(QA) → approved → rejected
- 제출: “제출” 클릭 시 서버에 Draft Freeze(읽기전용 스냅샷) 생성 후 QA Queue로 등록
- 반려: QA가 코멘트와 함께 rejected → 탐정 측에 알림 → 수정 후 재제출

## 5. 버전 관리

- 저장 시 version N, 제출 시 snapshot N.s
- 버전 비교 Diff(텍스트+블록 구조), 변경 이력 타임라인

## 6. 권한/보안

- 탐정: 자신의 배정 사건만 편집, 제출 가능
- 관리자(QA): 읽기/코멘트/승인/반려, 템플릿 관리
- 의뢰인: 승인된 최종본만 열람(기밀 영역 마스킹 옵션)
- 감사 로그: 모든 변경 사항 AuditLog에 기록

## 7. 성능/UX

- 대용량 본문(수만자) 가상화 렌더링, 이미지 지연 로딩
- 오프라인 캐시(작성 도중 네트워크 불안정 대비)
- 키보드 단축키: /명령(블록 삽입), Ctrl/Cmd+K 링크, Ctrl/Cmd+S 저장

## 8. 에지 사건

- 동시 편집 충돌: 서버 선점 잠금 + 변경 머지 제안
- 증거 삭제/잠금: 본문 참조 유지(빨간 경고 배지), 링크 끊김 방지
- 민감정보 포함: PII 마스킹 컴포넌트 제공

## 9. API/데이터 계약(초안)

- GET /cases/:id/reports (list)
- POST /cases/:id/reports (create draft)
- GET /reports/:id (load)
- PATCH /reports/:id (save blocks)
- POST /reports/:id/submit (freeze → review)
- POST /reports/:id/comment (anchor, text)
- GET /evidences?caseId=... (with meta/hash)

## 10. 컴포넌트 사양 예시

- ReportEditor
  - props: caseId, reportId?, userRole
  - state: blocks[], outline[], version, status, autosaveState
  - events: onInsertEvidence(evidenceId), onSubmit(), onComment(anchor)

## 11. 향후 확장

- 음성 받아쓰기(STT)로 서술 자동화
- 이미지/영상 인사이트 자동 요약 블록
- 법원 제출용 포맷 자동 변환(PDF 템플릿)
