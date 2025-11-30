# 🔐 routes/

이 폴더는 사용자 인증 및 API 라우트를 정의합니다.

## 포함된 파일

- `auth.js`: 회원가입, 로그인, 이메일 인증 등 인증 관련 API를 처리합니다.

## 사용 방법

```js
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
```
