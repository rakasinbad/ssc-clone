import { IQueryParams } from 'app/shared/models/query.model';

export interface IRegion {
    readonly id: NonNullable<number>;
    supplierId: number;
    name: string;
    code: string;
    updatedAt: string;
    createdAt:string;
}

export class  Region implements IRegion {
    readonly id: NonNullable<number>;
    supplierId: number;
    name: string;
    code: string;
    updatedAt: string;
    createdAt:string;

    constructor(data: Region) {
        const { id, code, name, supplierId,createdAt,updatedAt } = data;

        this.id = id;
        this.code = code;
        this.supplierId = supplierId;
        this.name = name;
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
    }
}

export interface IQueryParamsRegion extends IQueryParams {
    page?: number;
    perPage?: number;
}
