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
        this.province = province
            ? {
                  ...new Province(
                      province.id,
                      province.name,
                      province.createdAt,
                      province.updatedAt,
                      province.deletedAt
                  )
              }
            : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
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
