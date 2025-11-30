/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PaymentIntent = {
    id?: string;
    caseId?: string;
    amount?: number;
    currency?: string;
    status?: PaymentIntent.status;
    createdAt?: string;
};
export namespace PaymentIntent {
    export enum status {
        PENDING = 'pending',
        AUTHORIZED = 'authorized',
        CAPTURED = 'captured',
        CANCELED = 'canceled',
        FAILED = 'failed',
    }
}

