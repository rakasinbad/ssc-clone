import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

interface IStoreSetting extends ITimestamp {
    id: string;
    supplierId: string;
    maxDigit: string;
    supplierPrefix: string;
    storeIterationNumber: string;
}

export class StoreSetting implements IStoreSetting {
    id: string;
    supplierId: string;
    maxDigit: string;
    supplierPrefix: string;
    storeIterationNumber: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreSetting) {
        const {
            id,
            supplierId,
            maxDigit,
            supplierPrefix,
            storeIterationNumber,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.supplierId = supplierId;
        this.maxDigit = maxDigit;
        this.supplierPrefix = supplierPrefix;
        this.storeIterationNumber = storeIterationNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
