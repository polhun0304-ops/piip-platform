"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 사건 생성 API 테스트 코드 (axios)
const axios_1 = __importDefault(require("axios"));
async function createCase() {
    const caseData = {
        title: "테스트 사건",
        description: "API 테스트용 사건입니다.",
        status: "조사 중",
        date: "2025-11-13",
    };
    try {
        const res = await axios_1.default.post("http://localhost:3000/api/cases", caseData);
        console.log("API 응답:", res.data);
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err)) {
            console.error("API 오류:", err.response?.data || err.message);
        }
        else {
            console.error("API 오류:", err);
        }
    }
}
createCase();
