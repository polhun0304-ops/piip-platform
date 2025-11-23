"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const Detective_1 = require("../entities/Detective");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const userRepository = () => database_1.AppDataSource.getRepository(User_1.User);
const detectiveRepository = () => database_1.AppDataSource.getRepository(Detective_1.Detective);
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
/**
 * 회원가입
 * POST /api/auth/register
 */
router.post("/register", async (req, res) => {
    try {
        const { email, password, role, name, phone } = req.body;
        // 필수 필드 검증
        if (!email || !password || !role) {
            return res.status(400).json({
                error: "이메일, 비밀번호, 역할은 필수입니다.",
            });
        }
        // 역할 유효성 검증
        if (!["admin", "detective", "client"].includes(role)) {
            return res.status(400).json({
                error: "역할은 admin, detective, client 중 하나여야 합니다.",
            });
        }
        // 이메일 중복 확인
        const existingUser = await userRepository().findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                error: "이미 사용 중인 이메일입니다.",
            });
        }
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);
        // 탐정 역할의 경우 Detective 프로필 생성
        let detectiveId = undefined;
        if (role === "detective") {
            if (!name) {
                return res.status(400).json({
                    error: "탐정은 이름이 필수입니다.",
                });
            }
            const detective = detectiveRepository().create({
                name,
                phone: phone || "",
                status: "활동중",
                specialties: [],
                maxConcurrentCases: 5,
                currentCaseCount: 0,
                averageRating: 0,
                completedCases: 0,
                successRate: 0,
            });
            const savedDetective = await detectiveRepository().save(detective);
            detectiveId = savedDetective.id;
        }
        // 사용자 생성
        const user = userRepository().create({
            email,
            password: hashedPassword,
            role,
            isActive: true,
            detectiveId,
        });
        const savedUser = await userRepository().save(user);
        // JWT 토큰 생성
        const token = jwt.sign({
            userId: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
            detectiveId: savedUser.detectiveId,
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(201).json({
            message: "회원가입 성공",
            user: {
                id: savedUser.id,
                email: savedUser.email,
                role: savedUser.role,
                isActive: savedUser.isActive,
                detectiveId: savedUser.detectiveId,
            },
            token,
        });
    }
    catch (error) {
        console.error("회원가입 오류:", error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});
/**
 * 로그인
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // 필수 필드 검증
        if (!email || !password) {
            return res.status(400).json({
                error: "이메일과 비밀번호를 입력해주세요.",
            });
        }
        // 사용자 조회
        const user = await userRepository().findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                error: "이메일 또는 비밀번호가 올바르지 않습니다.",
            });
        }
        // 활성 상태 확인
        if (!user.isActive) {
            return res.status(403).json({
                error: "비활성화된 계정입니다. 관리자에게 문의하세요.",
            });
        }
        // 비밀번호 검증
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: "이메일 또는 비밀번호가 올바르지 않습니다.",
            });
        }
        // JWT 토큰 생성
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            detectiveId: user.detectiveId,
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({
            message: "로그인 성공",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                detectiveId: user.detectiveId,
            },
            token,
        });
    }
    catch (error) {
        console.error("로그인 오류:", error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});
/**
 * 현재 사용자 정보 조회
 * GET /api/auth/me
 */
router.get("/me", auth_1.verifyJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const user = await userRepository().findOne({
            where: { id: userId },
            select: ["id", "email", "role", "isActive", "detectiveId", "createdAt"],
        });
        if (!user) {
            return res.status(404).json({
                error: "사용자를 찾을 수 없습니다.",
            });
        }
        // 탐정인 경우 탐정 정보도 함께 반환
        let detectiveInfo = null;
        if (user.detectiveId) {
            detectiveInfo = await detectiveRepository().findOne({
                where: { id: user.detectiveId },
            });
        }
        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                detectiveId: user.detectiveId,
                createdAt: user.createdAt,
            },
            detective: detectiveInfo,
        });
    }
    catch (error) {
        console.error("사용자 정보 조회 오류:", error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});
/**
 * 비밀번호 변경
 * PUT /api/auth/password
 */
router.put("/password", auth_1.verifyJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: "현재 비밀번호와 새 비밀번호를 입력해주세요.",
            });
        }
        // 사용자 조회
        const user = await userRepository().findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({
                error: "사용자를 찾을 수 없습니다.",
            });
        }
        // 현재 비밀번호 검증
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: "현재 비밀번호가 올바르지 않습니다.",
            });
        }
        // 새 비밀번호 해싱 및 저장
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await userRepository().save(user);
        res.json({
            message: "비밀번호가 성공적으로 변경되었습니다.",
        });
    }
    catch (error) {
        console.error("비밀번호 변경 오류:", error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});
exports.default = router;
