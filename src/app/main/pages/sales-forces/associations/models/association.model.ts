import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IAssociation extends ITimestamp {
    id: string;
    name: string;
    code: string;
    type: string;
    warehouseId: string;
    invoiceGroupId: string;
    userId: string;
    storeAmount: number;
    // Untuk Association dengan type=outside
    storeName: string;
    storeId: string;
    externalId: string;
}

export class Association implements IAssociation {
    id: string;
    name: string;
    code: string;
    type: string;
    warehouseId: string;
    invoiceGroupId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    storeAmount: number;
    // Untuk Association dengan type=outside
    storeName: string;
    storeId: string;
    externalId: string;

    constructor(data: IAssociation) {
        const {
            id,
            name,
            code,
            type,
            warehouseId,
            invoiceGroupId,
            userId,
            createdAt,
            updatedAt,
            deletedAt,
            storeAmount,
            // Untuk Association dengan type=outside
            storeName,
            storeId,
            externalId,
        } = data;

        this.id = id;
        this.name = name;
        this.code = code;
        this.type = type;
        this.warehouseId = warehouseId;
        this.invoiceGroupId = invoiceGroupId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.storeAmount = storeAmount;
        // Untuk Association dengan type=outside
        this.storeName = storeName;
        this.storeId = storeId;
        this.externalId = externalId;
    }
}
