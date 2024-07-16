import { IQueryParams } from 'app/shared/models/query.model';
export interface IBranch {
    readonly id: NonNullable<number>;
    regionId: number;
    regionName: string;
    name: string;
    code: string;
    updatedAt: string;
}

export class Branch implements IBranch {
    readonly id: NonNullable<number>;
    regionId: number;
    regionName: string;
    name: string;
    code: string;
    updatedAt: string;

    constructor(data: Branch) {
        const { id, code, name, regionId, regionName, updatedAt } = data;

        this.id = id;
        this.code = code;
        this.regionId = regionId;
        this.regionName = regionName;
        this.name = name;
        this.updatedAt = updatedAt;
    }
}

export interface IBranchWarehouse {
    readonly id: NonNullable<number>;
    regionId: number;
    branchId: number;
    warehouseName: string;
    branchName: string;
    updatedAt: string;
}

export class BranchWarehouse implements IBranchWarehouse {
    readonly id: NonNullable<number>;
    regionId: number;
    branchId: number;
    warehouseName: string;
    branchName: string;
    updatedAt: string;

    constructor(data: BranchWarehouse) {
        const { branchId, branchName, id, regionId, updatedAt, warehouseName } = data;

        this.id = id;
        this.branchId = branchId;
        this.regionId = regionId;
        this.branchName = branchName;
        this.warehouseName = warehouseName;
        this.updatedAt = updatedAt;
    }
}

export interface IQueryParamsBranch extends IQueryParams {
    regionIds: number;
}

export interface IQueryParamsBranchTeritory extends IQueryParams {
    regionIds: number[];
    page?: number;
    perPage?: number;
}

export interface IQueryParamsBranchWarehouseTeritory extends IQueryParams {
    branchIds: number[];
    page?: number;
    perPage?: number;
}
