/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentIntent } from '../models/PaymentIntent';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentsService {
    /**
     * 결제 Intent 생성
     * @returns PaymentIntent 생성됨
     * @throws ApiError
     */
    public static createPaymentIntent({
        requestBody,
    }: {
        requestBody: {
            caseId: string;
            amount: number;
            currency?: string;
        },
    }): CancelablePromise<PaymentIntent> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payments/intents',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `유효성 검사 실패`,
            },
        });
    }
    /**
     * PaymentIntent 조회
     * @returns PaymentIntent OK
     * @throws ApiError
     */
    public static getPaymentIntent({
        intentId,
    }: {
        intentId: string,
    }): CancelablePromise<PaymentIntent> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/payments/intents/{intentId}',
            path: {
                'intentId': intentId,
            },
            errors: {
                404: `리소스 없음`,
            },
        });
    }
}
