"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
/**
 * GET /api/chat/:caseId
 * 특정 사건의 모든 채팅 메시지 조회
 */
router.get("/:caseId", auth_1.verifyJWT, async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.user?.userId;
        // 페이징 파라미터 처리 (limit, skip)
        const limit = Math.max(1, Math.min(1000, Number(req.query.limit) || 100));
        const skip = Math.max(0, Number(req.query.skip) || 0);
        // 읽지 않은 메시지를 읽음으로 표시 (다른 사용자가 보낸 메시지)
        if (userId) {
            await ChatMessage_1.default.updateMany({ caseId, senderId: { $ne: userId }, read: false }, { $set: { read: true } });
        }
        const caseMessages = await ChatMessage_1.default.find({ caseId })
            .sort({ timestamp: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        res.json({ items: caseMessages, limit, skip });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_1.default.error("Failed to fetch chat messages: %s", msg);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});
/**
 * POST /api/chat/:caseId
 * 새 메시지 전송
 */
router.post("/:caseId", auth_1.verifyJWT, async (req, res) => {
    try {
        const { caseId } = req.params;
        const { message, toUserId, encrypted, ciphertext, recipients } = req.body;
        const userId = req.user?.userId;
        const userRole = req.user?.role || "client";
        // Validate encrypted vs plaintext inputs
        const isEncrypted = Boolean(encrypted);
        if (isEncrypted) {
            // When encrypted, require either a ciphertext (single-recipient legacy) or recipients array
            const hasRecipients = Array.isArray(recipients) && recipients.length > 0;
            const hasCiphertext = !!ciphertext && String(ciphertext).trim() !== "";
            if (!hasRecipients && !hasCiphertext) {
                return res.status(400).json({
                    error: "Missing ciphertext or recipients for encrypted message",
                });
            }
        }
        else {
            if (!message || message.trim() === "") {
                return res.status(400).json({ error: "Message cannot be empty" });
            }
        }
        // Prepare stored document: for encrypted messages prefer storing recipients array (if provided).
        const storedMessage = isEncrypted
            ? ciphertext
                ? String(ciphertext)
                : ""
            : String(message).trim();
        const created = await ChatMessage_1.default.create({
            caseId,
            senderId: userId,
            senderRole: userRole,
            toUserId: toUserId || null,
            // store ciphertext into `message` when single-ciphertext provided; otherwise leave message empty and include recipients
            message: storedMessage,
            recipients: Array.isArray(recipients) && recipients.length > 0
                ? recipients
                : undefined,
            encrypted: isEncrypted,
            timestamp: new Date(),
            read: false,
        });
        // Emit via Socket.IO
        try {
            const io = req.app.get("io");
            if (io) {
                io.to(`case_${caseId}`).emit("chat:message", created);
            }
        }
        catch (emitErr) {
            const msg = emitErr instanceof Error ? emitErr.message : String(emitErr);
            logger_1.default.error("Failed to emit chat message via Socket.IO: %s", msg);
        }
        res.status(201).json(created);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_1.default.error("Failed to send message: %s", msg);
        // log full error for debugging (stack if available)
        if (err instanceof Error) {
            logger_1.default.error(err.stack || String(err));
        }
        else {
            logger_1.default.error(String(err));
        }
        res.status(500).json({ error: "Failed to send message" });
    }
});
/**
 * PATCH /api/chat/:caseId/:messageId/read
 * 메시지 읽음 처리
 */
router.patch("/:caseId/:messageId/read", auth_1.verifyJWT, async (req, res) => {
    try {
        const { messageId } = req.params;
        const updated = await ChatMessage_1.default.findByIdAndUpdate(messageId, { read: true }, { new: true }).lean();
        if (!updated) {
            return res.status(404).json({ error: "Message not found" });
        }
        res.json(updated);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_1.default.error("Failed to mark message as read: %s", msg);
        res.status(500).json({ error: "Failed to update message" });
    }
});
/**
 * GET /api/chat/:caseId/unread-count
 * 읽지 않은 메시지 개수 조회
 */
router.get("/:caseId/unread-count", auth_1.verifyJWT, async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.user?.userId;
        const unreadCount = await ChatMessage_1.default.countDocuments({
            caseId,
            senderId: { $ne: userId },
            read: false,
        });
        res.json({ count: unreadCount });
    }
    catch (error) {
        console.error("Failed to get unread count:", error);
        res.status(500).json({ error: "Failed to get unread count" });
    }
});
exports.default = router;
// 개발 편의용: 인증 없이 메시지를 푸시하여 Socket.IO 동작을 테스트하는 엔드포인트
// NOTE: 이 라우트는 production에서 비활성화되어야 합니다.
if (process.env.NODE_ENV !== "production") {
    // 개발 편의용: 인증 없이 메시지를 푸시하여 Socket.IO 동작을 테스트하는 엔드포인트
    router.post("/:caseId/test-push", async (req, res) => {
        try {
            const { caseId } = req.params;
            const body = req.body;
            const { message, senderRole = "client", senderId = "test-user" } = body;
            const created = await ChatMessage_1.default.create({
                caseId,
                senderId,
                senderRole,
                message: message || "test",
                encrypted: false,
                timestamp: new Date(),
                read: false,
            });
            try {
                const io = req.app.get("io");
                if (io)
                    io.to(`case_${caseId}`).emit("chat:message", created);
            }
            catch (emitErr) {
                const msg = emitErr instanceof Error ? emitErr.message : String(emitErr);
                logger_1.default.error("test-push emit failed: %s", msg);
            }
            res.json({ ok: true, message: created });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger_1.default.error("test-push error: %s", msg);
            res.status(500).json({ error: "test-push failed" });
        }
    });
}
