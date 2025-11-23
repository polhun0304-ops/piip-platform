import { Router, Request, Response } from "express";
import { verifyJWT } from "../middleware/auth";
import ChatMessage from "../models/ChatMessage";
import logger from "../utils/logger";

// 보강된 Request 타입 (미들웨어에서 user 속성 주입됨)
interface AuthenticatedRequest extends Request {
  user?: { userId?: string; role?: string };
}

// app.get('io') 타입 어노테이션
interface AppWithIO {
  get(key: string): import("socket.io").Server | undefined;
}

const router = Router();

/**
 * GET /api/chat/:caseId
 * 특정 사건의 모든 채팅 메시지 조회
 */
router.get(
  "/:caseId",
  verifyJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { caseId } = req.params;
      const userId = req.user?.userId;

      // 페이징 파라미터 처리 (limit, skip)
      const limit = Math.max(1, Math.min(1000, Number(req.query.limit) || 100));
      const skip = Math.max(0, Number(req.query.skip) || 0);

      // 읽지 않은 메시지를 읽음으로 표시 (다른 사용자가 보낸 메시지)
      if (userId) {
        await ChatMessage.updateMany(
          { caseId, senderId: { $ne: userId }, read: false },
          { $set: { read: true } }
        );
      }

      const caseMessages = await ChatMessage.find({ caseId })
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      res.json({ items: caseMessages, limit, skip });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("Failed to fetch chat messages: %s", msg);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
);

/**
 * POST /api/chat/:caseId
 * 새 메시지 전송
 */
router.post(
  "/:caseId",
  verifyJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { caseId } = req.params;
      const { message, toUserId, encrypted, ciphertext, recipients } =
        req.body as {
          message?: string;
          toUserId?: string;
          encrypted?: boolean;
          ciphertext?: string;
          recipients?: Array<{
            userId: string;
            ciphertext: string;
            iv?: string;
          }>;
        };
      const userId = req.user?.userId;
      const userRole = req.user?.role || "client";

      // Validate encrypted vs plaintext inputs
      const isEncrypted = Boolean(encrypted);

      if (isEncrypted) {
        // When encrypted, require either a ciphertext (single-recipient legacy) or recipients array
        const hasRecipients =
          Array.isArray(recipients) && recipients.length > 0;
        const hasCiphertext = !!ciphertext && String(ciphertext).trim() !== "";
        if (!hasRecipients && !hasCiphertext) {
          return res.status(400).json({
            error: "Missing ciphertext or recipients for encrypted message",
          });
        }
      } else {
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

      const created = await ChatMessage.create({
        caseId,
        senderId: userId,
        senderRole: userRole,
        toUserId: toUserId || null,
        // store ciphertext into `message` when single-ciphertext provided; otherwise leave message empty and include recipients
        message: storedMessage,
        recipients:
          Array.isArray(recipients) && recipients.length > 0
            ? recipients
            : undefined,
        encrypted: isEncrypted,
        timestamp: new Date(),
        read: false,
      });

      // Emit via Socket.IO
      try {
        const io = (req.app as unknown as AppWithIO).get("io");
        if (io) {
          io.to(`case_${caseId}`).emit("chat:message", created);
        }
      } catch (emitErr: unknown) {
        const msg =
          emitErr instanceof Error ? emitErr.message : String(emitErr);
        logger.error("Failed to emit chat message via Socket.IO: %s", msg);
      }

      res.status(201).json(created);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("Failed to send message: %s", msg);
      // log full error for debugging (stack if available)
      if (err instanceof Error) {
        logger.error(err.stack || String(err));
      } else {
        logger.error(String(err));
      }
      res.status(500).json({ error: "Failed to send message" });
    }
  }
);

/**
 * PATCH /api/chat/:caseId/:messageId/read
 * 메시지 읽음 처리
 */
router.patch(
  "/:caseId/:messageId/read",
  verifyJWT,
  async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const updated = await ChatMessage.findByIdAndUpdate(
        messageId,
        { read: true },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.json(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("Failed to mark message as read: %s", msg);
      res.status(500).json({ error: "Failed to update message" });
    }
  }
);

/**
 * GET /api/chat/:caseId/unread-count
 * 읽지 않은 메시지 개수 조회
 */
router.get(
  "/:caseId/unread-count",
  verifyJWT,
  async (req: Request, res: Response) => {
    try {
      const { caseId } = req.params;
      const userId = (req as AuthenticatedRequest).user?.userId;

      const unreadCount = await ChatMessage.countDocuments({
        caseId,
        senderId: { $ne: userId },
        read: false,
      });

      res.json({ count: unreadCount });
    } catch (error) {
      console.error("Failed to get unread count:", error);
      res.status(500).json({ error: "Failed to get unread count" });
    }
  }
);

export default router;

// 개발 편의용: 인증 없이 메시지를 푸시하여 Socket.IO 동작을 테스트하는 엔드포인트
// NOTE: 이 라우트는 production에서 비활성화되어야 합니다.
if (process.env.NODE_ENV !== "production") {
  // 개발 편의용: 인증 없이 메시지를 푸시하여 Socket.IO 동작을 테스트하는 엔드포인트
  router.post("/:caseId/test-push", async (req: Request, res: Response) => {
    try {
      const { caseId } = req.params;
      const body = req.body as {
        message?: string;
        senderRole?: string;
        senderId?: string;
      };
      const { message, senderRole = "client", senderId = "test-user" } = body;

      const created = await ChatMessage.create({
        caseId,
        senderId,
        senderRole,
        message: message || "test",
        encrypted: false,
        timestamp: new Date(),
        read: false,
      });

      try {
        const io = (req.app as unknown as AppWithIO).get("io");
        if (io) io.to(`case_${caseId}`).emit("chat:message", created);
      } catch (emitErr: unknown) {
        const msg =
          emitErr instanceof Error ? emitErr.message : String(emitErr);
        logger.error("test-push emit failed: %s", msg);
      }

      res.json({ ok: true, message: created });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("test-push error: %s", msg);
      res.status(500).json({ error: "test-push failed" });
    }
  });
}
