enum Status {
    active,
    inactive
}

type StatusString = keyof typeof Status;

enum StatusOrderDemo {
    packing,
    shipped,
    received,
    newOrder,
    completed,
    toBeShipped
}

type StatusOrderDemoString = keyof typeof StatusOrderDemo;

enum Source {
    cache,
    fetch
}

type SourceString = keyof typeof Source;

enum Sort {
    asc,
    desc
}

type SortString = keyof typeof Sort;

enum LogMode {
    group,
    groupCollapsed,
    table,
    default
}

type LogModeString = keyof typeof LogMode;

enum LogType {
    log,
    info,
    warn,
    error
}

type LogTypeString = keyof typeof LogType;

enum StatusError {
    error,
    success,
    warning
}

type StatusErrorString = keyof typeof StatusError;

export type TNullable<T> = T | null;
export type TLogMode = LogModeString;
export type TSort = SortString;
export type TSource = SourceString;
export type TStatus = StatusString;
export type TStatusError = StatusErrorString;
export type TStatusOrderDemo = StatusOrderDemoString;

export interface IBreadcrumbs {
    title: string;
    translate?: string;
    url?: string;
    active?: boolean;
}

export interface IPaginatedResponse<T> {
    total: number;
    limit: number;
    skip: number;
    data: Array<T>;
}

export interface IResponsePaginate {
    total: number;
    limit: number;
    skip: number;
}

export interface IPaginateResponse<T> {
    total: number;
    limit: number;
    skip: number;
    data: T[];
}

export class PaginateResponse<T> implements IPaginateResponse<T> {
    constructor(
        public total: number,
        public limit: number,
        public skip: number,
        public data: T[]
    ) {}
}

export interface IErrorHandler {
    id: string;
    errors: any;
}

export interface ILog {
    [key: string]: {
        type: LogTypeString;
        value: any;
    };
}

export interface IFooterActionConfig {
    progress: {
        title: {
            label: string;
            translate?: string;
            active: boolean;
        };
        value: {
            active: boolean;
        };
        active?: boolean;
    };
    action: {
        save: {
            label: string;
            translate?: string;
            active: boolean;
        };
        draft: {
            label: string;
            translate?: string;
            active: boolean;
        };
        cancel: {
            label: string;
            translate?: string;
            active: boolean;
        };
        goBack?: {
            label: string;
            translate?: string;
            active: boolean;
            url: string;
        };
    };
}

export type FilterUrban = 'city' | 'district' | 'urban';

export enum GeoParameterType {
    PROVINCE = 'Provinsi',
    CITY = 'Kota/Kabupaten',
    DISTRICT = 'Kecamatan',
    URBAN = 'Kelurahan'
}

interface IGeoParameter {
    readonly id: string;
    type: GeoParameterType;
    source: Array<string>;
}

export class GeoParameter implements IGeoParameter {
    constructor(
        public readonly id: string,
        public type: GeoParameterType,
        public source: Array<string>
    ) {}
}
