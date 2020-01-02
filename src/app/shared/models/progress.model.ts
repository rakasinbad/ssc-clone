import { ErrorHandler } from './global.model';

export enum ProgressStatus {
    READY = 'Ready',
    REQUEST = 'Request',
    STARTED = 'Started',
    FAILED = 'Failed',
    SUCCESS = 'Success'
}

interface IProgress {
    readonly id: NonNullable<string>;
    status: ProgressStatus;
    error: ErrorHandler;
    progress: number;
}

export class Progress implements IProgress {
    readonly id: NonNullable<string>;
    status: ProgressStatus;
    error: ErrorHandler;
    progress: number;

    constructor(data: Progress) {
        const { id, status, error, progress } = data;

        this.id = id;
        this.status = status;
        this.error = error;
        this.progress = progress;
    }
}
