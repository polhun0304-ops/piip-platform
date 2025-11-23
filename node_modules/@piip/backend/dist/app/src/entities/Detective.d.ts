/**
 * 탐정 프로필
 */
export declare class Detective {
    id: string;
    userId?: string;
    name: string;
    phone?: string;
    email?: string;
    licenseNumber?: string;
    region?: string;
    city?: string;
    experienceYears: number;
    status: "활동중" | "휴식중" | "비활성";
    specialties: DetectiveSpecialty[];
    maxConcurrentCases: number;
    currentCaseCount: number;
    averageRating: number;
    completedCases: number;
    successRate: number;
    bio?: string;
    workingHours?: {
        monday?: string[];
        tuesday?: string[];
        wednesday?: string[];
        thursday?: string[];
        friday?: string[];
        saturday?: string[];
        sunday?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
    lastActiveAt?: Date;
}
/**
 * 탐정의 전문 분야 및 숙련도
 */
export interface DetectiveSpecialty {
    category: string;
    level: "초급" | "중급" | "고급" | "전문가";
    casesHandled: number;
    successRate: number;
}
