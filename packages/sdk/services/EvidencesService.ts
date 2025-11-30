/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Evidence } from '../models/Evidence';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EvidencesService {
    /**
     * 증거 업로드
     * @returns Evidence 업로드 성공
     * @throws ApiError
     */
    public static uploadEvidence({
        formData,
    }: {
        formData: {
            caseId: string;
            file: Blob;
            type?: 'image' | 'audio' | 'video' | 'document' | 'other';
            tags?: Array<string>;
        },
    }): CancelablePromise<Evidence> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/evidences',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `유효성 검사 실패`,
            },
        });
    }
    /**
     * 증거 상세
     * @returns Evidence OK
     * @throws ApiError
     */
    public static getEvidence({
        evidenceId,
    }: {
        evidenceId: string,
    }): CancelablePromise<Evidence> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/evidences/{evidenceId}',
            path: {
                'evidenceId': evidenceId,
            },
            errors: {
                404: `리소스 없음`,
            },
        });
    }
}
