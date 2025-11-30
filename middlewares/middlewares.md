# 🔐 middlewares/

이 폴더는 Express에서 사용하는 미들웨어 함수들을 정의합니다.

## 포함된 파일

- `auth.js`: JWT 토큰을 검사하여 인증된 사용자만 접근할 수 있도록 처리하는 미들웨어

## 사용 방법

보호된 라우트에 아래처럼 적용합니다:

```js
const auth = require("../middlewares/auth");

router.get("/profile", auth, (req, res) => {
  res.json({ userId: req.user.userId });
});
```
