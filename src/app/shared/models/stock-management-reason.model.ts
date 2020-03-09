import { TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';

export interface IStockManagementReason extends ITimestamp {
    readonly id: NonNullable<string>;
    reason: string;
    method: string;
}

export class StockManagementReason implements IStockManagementReason {
    readonly id: NonNullable<string>;
    reason: string;
    method: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStockManagementReason) {
        const { id, reason, method, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.reason = reason ? String(reason).trim() : null;
        this.method = method ? String(method).trim() : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    clear(): StockManagementReason {
        return new StockManagementReason(undefined);
    }
}
