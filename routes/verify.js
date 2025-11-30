const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "토큰이 없습니다." });

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    const { email } = decoded;

    // 사용자 조회
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

    if (user.isVerified) {
      // 이미 인증된 경우에도 토큰 발급
      const loginToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res
        .status(200)
        .json({ message: "이미 인증된 사용자입니다.", token: loginToken });
    }

    // 인증 처리
    user.isVerified = true;
    user.verificationToken = null;
    user.lastLogin = new Date();
    await user.save();

    // 자동 로그인 토큰 발급
    const loginToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .status(200)
      .json({
        message: "이메일 인증 완료 및 자동 로그인 성공",
        token: loginToken,
      });
  } catch (err) {
    res.status(400).json({ error: "유효하지 않거나 만료된 토큰입니다." });
  }
});

module.exports = router;
