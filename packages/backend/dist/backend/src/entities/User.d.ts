/**
 * 사용자 엔티티
 * 관리자, 탐정, 의뢰인 역할 관리
 */
export declare class User {
    id: string;
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role: "admin" | "detective" | "client";
    isActive: boolean;
    detectiveId?: string;
    profileImage?: string;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
