const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 이메일 인증 토큰 생성
    const emailToken = jwt.sign({ email }, process.env.EMAIL_SECRET, {
      expiresIn: "1d",
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`;

    // 사용자 생성
    const user = new User({
      name,
      email,
      phone,
      role,
      password: hashedPassword,
      isVerified: false,
      verificationToken: emailToken,
      createdAt: new Date(),
    });

    await user.save();

    // 이메일 전송
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOTIFY_EMAIL,
        pass: process.env.NOTIFY_EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"PIIP Platform" <${process.env.NOTIFY_EMAIL}>`,
      to: email,
      subject: "📧 이메일 인증을 완료해주세요",
      html: `
        <h2>환영합니다, ${name}님!</h2>
        <p>아래 링크를 클릭하여 이메일 인증을 완료해주세요:</p>
        <a href="${verificationLink}">이메일 인증하기</a>
      `,
    });

    // 관리자 알림 (예: Slack, 이메일 등)
    await transporter.sendMail({
      from: `"PIIP Platform" <${process.env.NOTIFY_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🆕 신규 회원가입: ${name}`,
      text: `새로운 사용자가 가입했습니다.\n이름: ${name}\n이메일: ${email}\n전화번호: ${phone}\n역할: ${role}`,
    });

    res
      .status(201)
      .json({ message: "회원가입 성공. 이메일 인증을 완료해주세요." });
  } catch (err) {
    res.status(400).json({ error: "회원가입 실패", details: err.message });
  }
};
