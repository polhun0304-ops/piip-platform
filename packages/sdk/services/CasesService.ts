/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Case } from '../models/Case';
import type { CaseCreate } from '../models/CaseCreate';
import type { CaseStatus } from '../models/CaseStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CasesService {
    /**
     * 사건 목록 조회
     * @returns any 사건 목록
     * @throws ApiError
     */
    public static listCases({
        page = 1,
        pageSize = 20,
        status,
        search,
    }: {
        page?: number,
        pageSize?: number,
        status?: CaseStatus,
        search?: string,
    }): CancelablePromise<{
        items?: Array<Case>;
        page?: number;
        pageSize?: number;
        total?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/cases',
            query: {
                'page': page,
                'pageSize': pageSize,
                'status': status,
                'search': search,
            },
        });
    }
    /**
     * 사건 생성
     * @returns Case 생성됨
     * @throws ApiError
     */
    public static createCase({
        requestBody,
    }: {
        requestBody: CaseCreate,
    }): CancelablePromise<Case> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/cases',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `유효성 검사 실패`,
            },
        });
    }
    /**
     * 사건 상세
     * @returns Case OK
     * @throws ApiError
     */
    public static getCase({
        caseId,
    }: {
        caseId: string,
    }): CancelablePromise<Case> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/cases/{caseId}',
            path: {
                'caseId': caseId,
            },
            errors: {
                404: `리소스 없음`,
            },
        });
    }
    /**
     * 사건 일부 수정
     * @returns Case 수정됨
     * @throws ApiError
     */
    public static updateCase({
        caseId,
        requestBody,
    }: {
        caseId: string,
        requestBody: {
            title?: string;
            description?: string;
            priority?: 'low' | 'normal' | 'high' | 'urgent';
        },
    }): CancelablePromise<Case> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/cases/{caseId}',
            path: {
                'caseId': caseId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `리소스 없음`,
                422: `유효성 검사 실패`,
            },
        });
    }
    /**
     * 사건 상태 전이
     * @returns Case 상태 변경 완료
     * @throws ApiError
     */
    public static transitionCaseStatus({
        caseId,
        requestBody,
    }: {
        caseId: string,
        requestBody: {
            to: CaseStatus;
            reason?: string;
        },
    }): CancelablePromise<Case> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/cases/{caseId}/status',
            path: {
                'caseId': caseId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `허용되지 않은 전이`,
                422: `유효성 검사 실패`,
            },
        });
    }
}
