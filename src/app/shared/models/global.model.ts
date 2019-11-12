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
    table
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

export interface IResponsePaginate {
    total: number;
    limit: number;
    skip: number;
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
