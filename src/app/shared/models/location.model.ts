import { FuseUtils } from '@fuse/utils';
import { sortBy } from 'lodash';

import { IResponsePaginate, TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';

export interface IProvince extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    urbans?: Urban[];
}

export interface IProvinceResponse extends IResponsePaginate {
    data: Province[];
}

export class Province implements IProvince {
    readonly id: NonNullable<string>;
    name: string;
    urbans?: Urban[];
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IProvince) {
        const { id, name, urbans, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.name = name ? String(name).trim() : null;
        this.setUrbans = urbans;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setUrbans(value: Urban[]) {
        if (value && value.length > 0) {
            const newUrbans = value.map(row => new Urban(row));

            this.urbans = sortBy(newUrbans, ['urban'], ['asc']);
        } else {
            this.urbans = [];
        }
    }
}

export interface IDistrict extends ITimestamp {
    readonly id: NonNullable<string>;
    district: string;
    city: string;
    province: Province;
    urbans: Urban[];
}

export class District implements IDistrict {
    readonly id: NonNullable<string>;
    district: string;
    city: string;
    province: Province;
    urbans: Urban[];
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IDistrict) {
        const { id, district, city, province, urbans, createdAt, updatedAt, deletedAt } = data;

        this.id = id || FuseUtils.generateGUID();
        this.district = district ? String(district).trim() : null;
        this.city = city ? String(city).trim() : null;
        this.setProvince = province;
        this.setUrbans = urbans;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setProvince(value: Province) {
        this.province = value ? new Province(value) : null;
    }

    set setUrbans(value: Urban[]) {
        if (value && value.length > 0) {
            const newUrbans = value.map(row => new Urban(row));

            this.urbans = sortBy(newUrbans, ['urban'], ['asc']);
        } else {
            this.urbans = [];
        }
    }
}

interface IUrban extends ITimestamp {
    readonly id: NonNullable<string>;
    zipCode: string;
    city: string;
    district: string;
    urban: string;
    provinceId: string;
    province?: Province;
}

export class Urban implements IUrban {
    readonly id: NonNullable<string>;
    zipCode: string;
    city: string;
    district: string;
    urban: string;
    provinceId: string;
    province?: Province;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: Urban) {
        const {
            id,
            zipCode,
            city,
            district,
            urban,
            provinceId,
            province,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.zipCode = zipCode ? String(zipCode).trim() : null;
        this.city = city ? String(city).trim() : null;
        this.district = district ? String(district).trim() : null;
        this.urban = urban ? String(urban).trim() : null;
        this.provinceId = provinceId;
        this.setProvince = province;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setProvince(value: Province) {
        this.province = value ? new Province(value) : null;
    }
}
