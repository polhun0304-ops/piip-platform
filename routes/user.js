const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// 🔐 회원가입
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const user = new User({ name, email, phone, role, password });
    await user.save();
    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    res.status(400).json({ error: "회원가입 실패", details: err.message });
  }
});

// 🔐 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없음" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "비밀번호가 틀림" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "로그인 성공", token });
  } catch (err) {
    res.status(500).json({ error: "로그인 실패", details: err.message });
  }
});

// 👤 사용자 생성
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 👤 전체 사용자 조회
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 👤 특정 사용자 조회
router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json(user);
});

// 👤 사용자 수정
router.put("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!user)
    return res.status(404).json({ error: "수정할 사용자가 없습니다." });
  res.json(user);
});

// 👤 사용자 삭제
router.delete("/users/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user)
    return res.status(404).json({ error: "삭제할 사용자가 없습니다." });
  res.json({ message: "삭제 완료" });
});

module.exports = router;
