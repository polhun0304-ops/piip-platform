import { Case } from "./Case";
import { PricingTemplate } from "./PricingTemplate";
/**
 * 견적서 엔티티
 * 사건별 견적 정보 관리
 */
export declare class Quote {
    id: string;
    caseId: string;
    case: Case;
    pricingTemplateId?: string;
    pricingTemplate?: PricingTemplate;
    status: "draft" | "sent" | "approved" | "rejected" | "expired";
    basePrice: number;
    items?: QuoteItem[];
    selectedOptions?: string[];
    totalPrice: number;
    discount: number;
    finalPrice: number;
    estimatedDays?: number;
    notes?: string;
    validUntil?: Date;
    approvedAt?: Date;
    approvedBy?: string;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * 견적 항목 인터페이스
 */
export interface QuoteItem {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
