# PIIP Platform

PIIP(Platform for Incident & Identity Protection)은 사용자 인증과 사건 접수를 위한 백엔드 플랫폼입니다.  
Node.js와 MongoDB를 기반으로 하며, Express 프레임워크를 사용합니다.

## 📦 주요 기능

- 사용자 회원가입 및 로그인 (JWT 기반 인증)
- 사건 접수 및 조회 API
- MongoDB를 통한 데이터 저장
- .env 환경변수 설정 지원
- GitHub Copilot을 위한 `.github/copilot-instructions.md` 포함

## 🛠️ 기술 스택

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcryptjs
- dotenv

## 📁 프로젝트 구조

piip-platform/ ├── .github/ │ └── copilot-instructions.md ├── routes/ │ └── user.js ├── models/ │ └── User.js ├── .env ├── server.js └── README.md
