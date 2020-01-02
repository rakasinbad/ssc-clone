import { FuseUtils } from '@fuse/utils';
import { sortBy } from 'lodash';

import { TNullable } from './global.model';
import { Province } from './province.model';
import { ITimestamp } from './timestamp.model';
import { Urban } from './urban.model';

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
