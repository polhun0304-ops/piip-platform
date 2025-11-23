import { Case } from "./Case";
export declare class Evidence {
    id: string;
    label: string;
    type: "이미지" | "오디오" | "문서" | "비디오";
    date?: string;
    filePath?: string;
    caseId?: string;
    case?: Case;
    createdAt: Date;
    updatedAt: Date;
}
