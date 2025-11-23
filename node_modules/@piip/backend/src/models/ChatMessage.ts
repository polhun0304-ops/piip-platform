import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChatMessage extends Document {
  caseId: string;
  senderId: string;
  senderRole: "client" | "detective" | "admin";
  toUserId?: string | null;
  message: string;
  encrypted: boolean;
  // Optional per-recipient ciphertexts for E2EE (PoC)
  recipients?: Array<{
    userId: string;
    ciphertext: string;
    iv?: string;
  }>;
  timestamp: Date;
  read: boolean;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    caseId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    senderRole: { type: String, required: true },
    toUserId: { type: String, required: false, default: null },
    // message may be empty for fully encrypted messages where per-recipient ciphertexts are used
    message: { type: String, required: false, default: "" },
    // recipients: optional array of per-recipient ciphertexts (userId + ciphertext + optional iv)
    recipients: {
      type: [
        {
          userId: { type: String },
          ciphertext: { type: String },
          iv: { type: String },
        },
      ],
      required: false,
      default: undefined,
    },
    encrypted: { type: Boolean, required: true, default: true },
    timestamp: { type: Date, required: true, default: () => new Date() },
    read: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  }
);

// Compound indexes for common queries
ChatMessageSchema.index({ caseId: 1, timestamp: 1 });
ChatMessageSchema.index({ caseId: 1, read: 1 });

const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessage;
