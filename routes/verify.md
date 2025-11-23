# 📧 verify.js

이 라우트는 이메일 인증을 완료하고 자동 로그인까지 처리합니다.

## 경로

- `GET /api/verify-email?token=...`

## 기능

- 이메일 인증 토큰 검증
- 사용자 `isVerified` 업데이트
- JWT 로그인 토큰 자동 발급
- 응답에 `{ message, token }` 포함

## 사용 예시

```js
const verifyRoutes = require("./routes/verify");
app.use("/api", verifyRoutes);
