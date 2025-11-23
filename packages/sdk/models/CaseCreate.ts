/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CaseCreate = {
    title: string;
    description: string;
    priority?: CaseCreate.priority;
};
export namespace CaseCreate {
    export enum priority {
        LOW = 'low',
        NORMAL = 'normal',
        HIGH = 'high',
        URGENT = 'urgent',
    }
}

