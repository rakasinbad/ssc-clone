import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IUrban extends ITimestamp {
    id: string;
    zipCode: string;
    city: string;
    district: string;
    urban: string;
    provinceId: string;
}

export class Urban implements IUrban {
    id: string;
    zipCode: string;
    city: string;
    district: string;
    urban: string;
    provinceId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: IUrban) {
        const {
            id,
            zipCode,
            city,
            district,
            urban,
            provinceId,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.zipCode = zipCode;
        this.city = city;
        this.district = district;
        this.urban = urban;
        this.provinceId = provinceId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
