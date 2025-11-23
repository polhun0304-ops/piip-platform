# 🔐 authController.js

이 파일은 사용자 인증 관련 컨트롤러 함수들을 정의합니다.

## 포함된 함수

- `signup(req, res)`: 사용자 회원가입 처리
  - 비밀번호는 bcrypt로 해싱
  - 이메일 인증 토큰 생성 및 전송
  - 관리자에게 신규 가입 알림 전송

## 사용 방법

라우트에서 아래처럼 연결합니다:

```js
const authController = require("../controllers/authController");
router.post("/signup", authController.signup);
```
