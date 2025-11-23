import { Evidence } from "./Evidence";
export declare class Case {
    id: string;
    title: string;
    description?: string;
    status: "조사 중" | "종료" | "대기";
    date?: string;
    clientUserId?: string;
    createdAt: Date;
    updatedAt: Date;
    evidences?: Evidence[];
}
