import { Province, Timestamp, TNullable } from 'app/shared/models';

export class Urban extends Timestamp {
    id: string;
    zipCode: string;
    city: string;
    district: string;
    urban: string;
    provinceId: string;
    province: Province;

    constructor(
        id: string,
        zipCode: string,
        city: string,
        district: string,
        urban: string,
        provinceId: string,
        province: Province,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.zipCode = zipCode;
        this.city = city;
        this.district = district;
        this.urban = urban;
        this.provinceId = provinceId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        if (province) {
            const newProvince = new Province(
                province.id,
                province.name,
                province.createdAt,
                province.updatedAt,
                province.deletedAt
            );

            newProvince.urbans = province.urbans ? province.urbans : null;

            this.province = newProvince;
        } else {
            this.province = null;
        }
    }
}

export class UrbanAssoc extends Timestamp {
    id: string;
    zipCode: string;
    city: string;
    district: string;
    urban: string;
    provinceId: string;

    constructor(
        id: string,
        zipCode: string,
        city: string,
        district: string,
        urban: string,
        provinceId: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
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
