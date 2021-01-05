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

    sellerId: string;
    storeName: string;
    start_date: string;
    end_date: string;
    storeOwnerName: string;
    address: string;
    province: string;
    skpStatus: string;
    skpUpdateDate: string;
    availableFrom: string;
    availableTo: string;
    image_url: string;

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
            sellerId,
            storeName,
            start_date,
            end_date,
            storeOwnerName,
            address,
            province,
            skpStatus,
            skpUpdateDate,
            availableFrom,
            availableTo,
            image_url
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
        this.createdAt = createdAt  || null;
        this.updatedAt = updatedAt  || null;
        this.deletedAt = deletedAt;

        this.sellerId = sellerId || null;
        this.storeName = storeName || null;
        this.start_date = start_date || null;
        this.end_date = end_date || null;
        this.storeName = storeName || null;
        this.storeOwnerName = storeOwnerName || null;
        this.address = address || null;
        this.province = province || null;
        this.skpStatus = skpStatus || null;
        this.skpUpdateDate = skpUpdateDate || null;
        
        this.availableFrom = availableFrom || null;
        this.availableTo = availableTo || null;
        this.image_url = image_url || null;
    }
}

export class skpPromoList {
    readonly id: NonNullable<string>;
    sellerId: string;
    storeName: string;
    name: string;
    start_date: string;
    end_date: string;
    constructor(data: skpPromoList) {
        const {
            id,
            sellerId,
            storeName,
            name,
            start_date,
            end_date,
        } = data

        this.id = id || null;
        this.sellerId = sellerId;
        this.storeName = storeName;
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

    constructor(data: skpStoreList) {
        const {
            id,
            storeName,
            storeOwnerName,
            address,
            province,
            skpStatus,
            skpUpdateDate
        } = data;

        this.id = id;
        this.storeName = storeName || null;
        this.storeOwnerName = storeOwnerName || null;
        this.address = address || null;
        this.province = province || null;
        this.skpStatus = skpStatus || null;
        this.skpUpdateDate = skpUpdateDate || null;
    }
}
