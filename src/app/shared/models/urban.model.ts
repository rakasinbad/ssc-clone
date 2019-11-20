import { TNullable } from './global.model';
import { Province } from './province.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IUrban extends ITimestamp {
    id: string;
    zipCode: string;
    city: string;
    district: string;
    urban: string;
    provinceId: string;
    province?: Province;
}

export class Urban extends Timestamp implements IUrban {
    public province?: Province;

    constructor(
        public id: string,
        public zipCode: string,
        public city: string,
        public district: string,
        public urban: string,
        public provinceId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.zipCode = zipCode ? zipCode.trim() : null;
        this.city = city ? city.trim() : null;
        this.urban = urban ? urban.trim() : null;
    }

    set setProvince(value: Province) {
        if (value) {
            const newProvince = new Province(
                value.id,
                value.name,
                value.createdAt,
                value.updatedAt,
                value.deletedAt
            );

            if (value.urbans) {
                newProvince.setUrbans = value.urbans;
            }

            this.province = newProvince;
        } else {
            this.province = null;
        }
    }
}
