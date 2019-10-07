enum Status {
    active,
    inactive
}

type StatusString = keyof typeof Status;

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
