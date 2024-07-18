import { HelperService } from 'app/shared/helpers';
import { BranchWarehouse } from 'app/shared/models/branch.model';

export interface IInternalEmployeeDetails {
    id: number;
    imageUrl: string;
    fullName: string;
    email: string;
    mobilePhoneNo: string;
    roleNames: string;
    roleIds: number[];
    platform: string;
    privileges: string;
}

export class InternalEmployeeDetails implements IInternalEmployeeDetails {
    id: number;
    imageUrl: string;
    fullName: string;
    email: string;
    mobilePhoneNo: string;
    roleNames: string;
    roleIds: number[];
    platform: string;
    privileges: string;

    constructor(data: IInternalEmployeeDetails) {
        const {
            id,
            imageUrl,
            fullName,
            email,
            mobilePhoneNo,
            roleNames,
            roleIds,
            platform,
            privileges,
        } = data;

        HelperService.debug('RESPONSE', data);

        this.id = id;
        this.imageUrl = imageUrl;
        this.fullName = fullName;
        this.email = email;
        this.mobilePhoneNo = mobilePhoneNo;
        this.roleNames = roleNames;
        this.roleIds = roleIds;
        this.platform = platform;
        this.privileges = privileges;
    }
}

export interface ISelectedWarehouses {
    regionIds: string[];
    branchIds: string[];
    warehouses: BranchWarehouse[];
    firstWarehouseName: string;
    totalWarehouse: number;
}

export interface IInternalWarehouses {
    data: ISelectedWarehouses;
}

export class InternalWarehouses implements ISelectedWarehouses {
    regionIds: string[];
    branchIds: string[];
    warehouses: BranchWarehouse[];
    firstWarehouseName: string;
    totalWarehouse: number;

    constructor(data: IInternalWarehouses) {
        const { regionIds, branchIds, warehouses, firstWarehouseName, totalWarehouse } = data.data;

        this.regionIds = regionIds;
        this.branchIds = branchIds;
        this.warehouses = warehouses;
        this.firstWarehouseName = firstWarehouseName;
        this.totalWarehouse = totalWarehouse;
    }
}
