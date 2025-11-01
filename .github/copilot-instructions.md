# PIIP Platform 코딩 가이드라인

## 프로젝트 아키텍처

이 프로젝트는 순수 HTML, CSS, JavaScript를 사용하는 클라이언트 사이드 SPA(Single Page Application)입니다. 프로젝트는 단순성과 접근성을 우선시하며, 외부 의존성 없이 순수 웹 표준 기술만을 사용합니다.

### 핵심 설계 결정

- 외부 프레임워크/라이브러리 미사용 -> 빠른 로딩과 간단한 유지보수
- localStorage 기반 상태 관리 -> 오프라인 지원
- CSS 변수 기반 테마 시스템 -> 다크/라이트 모드 전환
- 접근성 우선 설계 -> ARIA 속성과 시맨틱 마크업

### 주요 컴포넌트

- `index.html`: SPA의 진입점, 시맨틱 구조화된 마크업
- `app.js`: 모듈화된 상태 관리와 이벤트 처리
- `styles.css`: CSS 변수 기반 테마 시스템

### 데이터 흐름

1. 상태는 `localStorage`를 통해 영구 저장됨
2. 전역 `tasks` 배열이 주요 상태 관리
3. 상태 변경 -> 저장 -> 렌더링 패턴 사용

## 코드 스타일

### HTML

- 시맨틱 HTML5 요소 사용 (`header`, `main`, `section` 등)
- 접근성 속성 필수 포함 (`aria-label`, `aria-live` 등)
- 예시: `index.html`의 작업 목록 구조 참조

### JavaScript

- 모던 JavaScript (ES6+) 사용
- 상태 변경 함수는 항상 `saveTasks()`와 `renderTasks()` 호출
- XSS 방지를 위해 `escapeHtml()` 함수 사용 필수

```js
// 상태 변경 패턴 예시
function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}
```

### CSS

- CSS 변수로 테마 시스템 구현
- 반응형 디자인을 위한 유연한 레이아웃
- 클래스 명명 규칙: 기능-요소 패턴 (예: `task-item`, `btn-primary`)

## 명명 규칙

- 컴포넌트/클래스: PascalCase
- 변수/함수: camelCase
- 프라이빗 멤버: \_prefix
- 상수: ALL_CAPS

## 개발 워크플로우

### 로컬 개발 시작하기

1. 프로젝트 실행: VS Code Live Server 또는 로컬 HTTP 서버 사용

   ```powershell
   python -m http.server 8000  # 또는
   npx http-server
   ```

2. 개발자 도구 준비
   - Console: 상태 디버깅 (`console.log(tasks)`)
   - Application > Local Storage: 데이터 저장소 확인
   - Lighthouse: 성능/접근성 검사

### 새로운 기능 추가 순서

1. HTML: 시맨틱 마크업과 ARIA 속성 추가

   ```html
   <section class="task-section" aria-label="작업 목록">
     <h2 class="visually-hidden">할 일 목록</h2>
     <!-- 컨텐츠 -->
   </section>
   ```

2. JavaScript: 상태 관리 함수 구현

   - 항상 `saveTasks()`와 `renderTasks()` 호출
   - 입력 검증은 `isValidTask()` 사용

3. CSS: 테마 시스템 활용
   ```css
   .new-component {
     background: var(--bg-color);
     color: var(--text-color);
   }
   ```

### 품질 검사

- 접근성: Chrome DevTools Lighthouse 실행
- 반응형: 다양한 화면 크기 테스트
- 테마: 다크/라이트 모드 전환 확인
- 브라우저 호환성: Chrome/Firefox/Safari 테스트

## 코드 품질

- 의미있는 변수/함수명 사용
- 복잡한 로직에 주석 추가
- 사용자 입력 검증 (`isValidTask` 함수 참조)
- XSS 방지를 위한 HTML 이스케이프 처리

## 크로스컴포넌트 패턴

- 상태 변경 -> 저장 -> 렌더링 순서 준수
- 테마 시스템: CSS 변수로 일관성 유지
- 이벤트 위임: 상위 컨테이너에서 이벤트 처리


```markdown
# Copilot Instructions

이 프로젝트는 PIIP 플랫폼을 위한 것입니다.  
Copilot은 다음을 도와야 합니다:

- 사용자 인증 및 사건 접수 API를 쉽게 설명하고 구현합니다.
- 초보자가 따라할 수 있도록 단계별로 안내합니다.
- MongoDB와 Express를 연결하는 방법을 설명합니다.
