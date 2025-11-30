/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { UserSummary } from '../models/UserSummary';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * 로그인
     * @returns LoginResponse 로그인 성공
     * @throws ApiError
     */
    public static login({
        requestBody,
    }: {
        requestBody: LoginRequest,
    }): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `인증 실패`,
                422: `유효성 검사 실패`,
            },
        });
    }
    /**
     * 현재 사용자 정보
     * @returns UserSummary OK
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<UserSummary> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/me',
            errors: {
                401: `인증 실패`,
            },
        });
    }
}
