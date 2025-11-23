# 📦 routes/

이 폴더는 사용자 인증 및 모델 기반 API를 정의합니다.

## 포함된 파일

- `auth.js`: 회원가입, 로그인, 사용자(User) 모델에 대한 CRUD API (JWT 인증 적용)

## 사용 방법

```js
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);
```
