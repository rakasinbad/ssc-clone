import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

export interface ISegmentedStoreType extends ITimestamp {
    id: string;
    typeId: string;
    storeId: string;
}

export class SegmentedStoreType implements ISegmentedStoreType {
    id: string;
    typeId: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: ISegmentedStoreType) {
        const {
            id,
            typeId,
            storeId,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.typeId = typeId;
        this.storeId = storeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
