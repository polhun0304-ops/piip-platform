/**
 * 가격표 템플릿
 * 업무별 기본 가격 및 옵션별 추가 비용 관리
 */
export declare class PricingTemplate {
    id: string;
    category: string;
    name: string;
    description?: string;
    basePrice: number;
    priceUnit: "per_case" | "per_day" | "per_hour";
    estimatedDays?: number;
    options?: PricingOption[];
    includedServices?: string[];
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * 추가 옵션 인터페이스
 */
export interface PricingOption {
    key: string;
    label: string;
    description?: string;
    price: number;
    priceType: "fixed" | "percentage";
}
