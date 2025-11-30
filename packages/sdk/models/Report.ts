/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Report = {
    id?: string;
    caseId?: string;
    status?: Report.status;
    version?: number;
    title?: string;
    summary?: string;
    body?: Record<string, any>;
};
export namespace Report {
    export enum status {
        DRAFT = 'draft',
        IN_REVIEW = 'in_review',
        APPROVED = 'approved',
        REJECTED = 'rejected',
    }
}

