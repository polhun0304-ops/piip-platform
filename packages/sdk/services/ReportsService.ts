/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Report } from '../models/Report';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * 리포트 초안 생성
     * @returns Report 생성됨
     * @throws ApiError
     */
    public static createReport({
        requestBody,
    }: {
        requestBody: {
            caseId: string;
            title: string;
        },
    }): CancelablePromise<Report> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reports',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `유효성 검사 실패`,
            },
        });
    }
    /**
     * 리포트 조회
     * @returns Report OK
     * @throws ApiError
     */
    public static getReport({
        reportId,
    }: {
        reportId: string,
    }): CancelablePromise<Report> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/{reportId}',
            path: {
                'reportId': reportId,
            },
            errors: {
                404: `리소스 없음`,
            },
        });
    }
    /**
     * 리포트 블록/본문 수정
     * @returns Report 수정됨
     * @throws ApiError
     */
    public static updateReport({
        reportId,
        requestBody,
    }: {
        reportId: string,
        requestBody: {
            summary?: string;
            body?: Record<string, any>;
        },
    }): CancelablePromise<Report> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/reports/{reportId}',
            path: {
                'reportId': reportId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `유효성 검사 실패`,
            },
        });
    }
    /**
     * 리포트 제출(검토 요청)
     * @returns Report 제출됨
     * @throws ApiError
     */
    public static submitReport({
        reportId,
    }: {
        reportId: string,
    }): CancelablePromise<Report> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reports/{reportId}/submit',
            path: {
                'reportId': reportId,
            },
            errors: {
                422: `유효성 검사 실패`,
            },
        });
    }
}
