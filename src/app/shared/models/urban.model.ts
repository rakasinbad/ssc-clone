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
    private _province?: Province;

    constructor(
        private _id: string,
        private _zipCode: string,
        private _city: string,
        private _district: string,
        private _urban: string,
        private _provinceId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get zipCode(): string {
        return this._zipCode;
    }

    set zipCode(value: string) {
        this._zipCode = value ? value.trim() : value;
    }

    get city(): string {
        return this._city;
    }

    set city(value: string) {
        this._city = value ? value.trim() : value;
    }

    get district(): string {
        return this._district;
    }

    set district(value: string) {
        this._district = value ? value.trim() : value;
    }

    get urban(): string {
        return this._urban;
    }

    set urban(value: string) {
        this._urban = value ? value.trim() : value;
    }

    get provinceId(): string {
        return this._provinceId;
    }

    set provinceId(value: string) {
        this._provinceId = value;
    }

    get province(): Province {
        return this._province;
    }

    set province(value: Province) {
        this._province = value;
    }
}
