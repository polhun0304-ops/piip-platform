/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CaseStatus } from './CaseStatus';
export type Case = {
    id: string;
    code?: string;
    status: CaseStatus;
    title: string;
    description?: string;
    clientId?: string;
    assignedDetectiveId?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

