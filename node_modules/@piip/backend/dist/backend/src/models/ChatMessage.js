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
const mongoose_1 = __importStar(require("mongoose"));
const ChatMessageSchema = new mongoose_1.Schema({
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
}, {
    versionKey: false,
});
// Compound indexes for common queries
ChatMessageSchema.index({ caseId: 1, timestamp: 1 });
ChatMessageSchema.index({ caseId: 1, read: 1 });
const ChatMessage = mongoose_1.default.models.ChatMessage ||
    mongoose_1.default.model("ChatMessage", ChatMessageSchema);
exports.default = ChatMessage;
