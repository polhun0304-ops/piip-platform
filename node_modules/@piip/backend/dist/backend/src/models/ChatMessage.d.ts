import { Document, Model } from "mongoose";
export interface IChatMessage extends Document {
    caseId: string;
    senderId: string;
    senderRole: "client" | "detective" | "admin";
    toUserId?: string | null;
    message: string;
    encrypted: boolean;
    recipients?: Array<{
        userId: string;
        ciphertext: string;
        iv?: string;
    }>;
    timestamp: Date;
    read: boolean;
}
declare const ChatMessage: Model<IChatMessage>;
export default ChatMessage;
