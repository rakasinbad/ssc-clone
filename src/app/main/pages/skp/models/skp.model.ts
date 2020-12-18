import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { EStatus, TNullable } from 'app/shared/models/global.model';

export class SkpModel implements ITimestamp {
    readonly id: NonNullable<string>;
    supplierId: string;
    name: string;
    description: string;
    endDate: string;
    startDate: string;
    notes: string;
    header: string;
    imageUrl: string;
    file: string;
    status: EStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: SkpModel) {
        const {
            id,
            supplierId,
            name,
            description,
            endDate,
            startDate,
            notes,
            header,
            imageUrl,
            file,
            status,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.supplierId = supplierId || null;
        this.name = name ? String(name).trim() : null;
        this.description = description;
        this.endDate = endDate;
        this.startDate = startDate;
        this.notes = notes || null;
        this.header = header || null;
        this.imageUrl = imageUrl || null;
        this.file = file || null;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

    }
}

export class skpPromoList {
    readonly id: NonNullable<string>;
    name: string;
    start_date: string;
    end_date: string;
    constructor(dataPromo: skpPromoList) {
        const {
            id,
            name,
            start_date,
            end_date,
        } = dataPromo

        this.id = id;
        this.name = name;
        this.start_date = start_date;
        this.end_date = end_date;
    }
}

export class skpStoreList{
    readonly id: NonNullable<string>;
    storeName: string;
    storeOwnerName: string;
    address: string;
    province: string;
    skpStatus: string;
    skpUpdateDate: string;
    start_date: string;
    end_date: string;

    constructor(dataStore: skpStoreList) {
        const {
            id,
            storeName,
            storeOwnerName,
            address,
            province,
            skpStatus,
            skpUpdateDate
        } = dataStore

        this.id = id;
        this.storeName = storeName || null;
        this.storeOwnerName = storeOwnerName || null;
        this.address = address || null;
        this.province = province || null;
        this.skpStatus = skpStatus || null;
        this.skpUpdateDate = skpUpdateDate || null;
    }
}
