// 📦 외부 라이브러리 불러오기
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// 📦 라우터 불러오기
const userRoutes = require("./routes/user");

// 📦 환경변수 설정
dotenv.config();

// 📦 Express 앱 생성
const app = express();
const PORT = process.env.PORT || 3000;

// 📦 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 파싱

// 📦 라우터 연결
app.use("/api/users", userRoutes); // 회원가입/로그인 API

// 📦 MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB 연결 성공");

    // 📦 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB 연결 실패:", err.message);
  });
