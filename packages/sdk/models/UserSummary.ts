/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserSummary = {
    id?: string;
    role?: UserSummary.role;
    name?: string;
};
export namespace UserSummary {
    export enum role {
        CLIENT = 'client',
        DETECTIVE = 'detective',
        ADMIN = 'admin',
    }
}

