# PIIP (Private Investigation Information Platform)

## 프로젝트 개요
PIIP는 현대적인 탐정 업무를 지원하는 통합 정보 플랫폼입니다. AI 기술과 자동화를 통해 조사 프로세스를 효율화하고, 데이터 기반의 의사결정을 지원합니다.

## 주요 기능
- 사건 관리 및 추적
- 인물 정보 데이터베이스
- 증거 관리 시스템
- AI 기반 데이터 분석
- 실시간 협업 도구
- 모바일 현장 조사 지원

## 기술 스택
- Backend: Node.js + Express + TypeScript
- Frontend: React + TypeScript
- Mobile: React Native
- Database: PostgreSQL
- AI/ML: TensorFlow.js
- API: REST + GraphQL

## 프로젝트 구조
```
packages/
├── backend/        # 백엔드 서버 (Node.js + Express)
├── frontend/       # 웹 클라이언트 (React)
├── mobile/         # 모바일 앱 (React Native)
├── shared/         # 공유 타입과 유틸리티
└── docs/          # 문서 및 설계 파일
```

## 시작하기
1. 저장소 클론
```bash
git clone https://github.com/polhun0304-ops/piip-platform.git
cd piip-platform
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
# 백엔드 실행
cd packages/backend
npm run dev

# 프론트엔드 실행
cd packages/frontend
npm run dev

# 모바일 앱 실행
cd packages/mobile
npm run start
```

## 문서
자세한 문서는 `packages/docs` 디렉토리를 참조하세요.
- [API 문서](packages/docs/api-spec.md)
- [데이터베이스 설계](packages/docs/database.md)
- [아키텍처 문서](packages/docs/architecture.md)
>>>>>>> feat/ui/protected-routes
