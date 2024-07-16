export interface WarehouseRegion {
    id: string;
    supplierId: string;
    code: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
}

export interface WarehouseBranch {
    id: string;
    regionId: string;
    code: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
    region: WarehouseRegion;
}
