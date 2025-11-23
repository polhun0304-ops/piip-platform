const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");

// 🔐 회원가입 (컨트롤러 사용)
router.post("/signup", authController.signup);

// 🔐 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자 조회 + 비밀번호 포함
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(404)
        .json({ error: "이메일 또는 비밀번호가 잘못되었습니다." });

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 잘못되었습니다." });

    // 이메일 인증 여부 확인
    if (!user.isVerified)
      return res.status(403).json({ error: "이메일 인증이 필요합니다." });

    // JWT 발급
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 👤 사용자 CRUD (JWT 인증 적용)

// 생성
router.post("/users", auth, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 전체 조회
router.get("/users", auth, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 단일 조회
router.get("/users/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json(user);
});

// 수정
router.put("/users/:id", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!user)
    return res.status(404).json({ error: "수정할 사용자가 없습니다." });
  res.json(user);
});

// 삭제
router.delete("/users/:id", auth, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user)
    return res.status(404).json({ error: "삭제할 사용자가 없습니다." });
  res.json({ message: "삭제 완료" });
});

module.exports = router;
