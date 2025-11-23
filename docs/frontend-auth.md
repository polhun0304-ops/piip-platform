# 🔐 프론트엔드 인증 흐름

이 문서는 이메일 인증 후 자동 로그인 처리 방식에 대해 설명합니다.

## 관련 파일

- `/src/pages/auth/VerifyEmailPage.jsx`: 이메일 인증 후 토큰 저장 및 리디렉션 처리
- `/api/verify-email`: 백엔드에서 토큰 검증 및 로그인 토큰 발급

## 흐름 요약

1. 사용자가 이메일 링크 클릭 → `/verify-email?token=...`
2. 프론트엔드에서 토큰을 백엔드에 전달
3. 백엔드에서 인증 처리 후 로그인 토큰 응답
4. 프론트엔드에서 토큰 저장 → 로그인 상태 유지
5. `/dashboard` 또는 원하는 페이지로 리디렉션

## 토큰 저장 방식

- 기본: `localStorage.setItem("token", ...)`
- 보안 강화: HttpOnly 쿠키 방식은 서버에서 설정 필요

## 리디렉션 경로

- 기본: `/dashboard`
- 필요 시 `navigate("/mypage")` 등으로 변경 가능
