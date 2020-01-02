import { sortBy } from 'lodash';

import { IResponsePaginate, TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';
import { Urban } from './urban.model';

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
