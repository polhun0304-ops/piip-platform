/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Evidence = {
    id?: string;
    caseId?: string;
    type?: Evidence.type;
    url?: string;
    mimeType?: string;
    size?: number;
    checksum?: string;
    ocrText?: string | null;
    tags?: Array<string>;
};
export namespace Evidence {
    export enum type {
        IMAGE = 'image',
        AUDIO = 'audio',
        VIDEO = 'video',
        DOCUMENT = 'document',
        OTHER = 'other',
    }
}

