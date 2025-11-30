import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyEmailPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        alert("유효하지 않은 인증 링크입니다.");
        return;
      }

      try {
        const res = await axios.get(`/api/verify-email?token=${token}`);
        const { token: loginToken } = res.data;

        // ✅ 토큰 저장
        localStorage.setItem("token", loginToken);

        // ✅ 리디렉션
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        alert("이메일 인증에 실패했습니다.");
      }
    };

    verifyEmail();
  }, [navigate]);

  return <p>이메일 인증 중입니다...</p>;
}

export default VerifyEmailPage;
