import { Catalogue } from './../../main/pages/catalogues/models/catalogue.model';
import { EStatus, TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';

export interface IWarehouseCatalogue extends ITimestamp {
    readonly id: NonNullable<string>;
    warehouseId: string;
    catalogueId: string;
    stock: number;
    unlimitedStock: boolean;
    status: EStatus;
    catalogoue: Catalogue;
}

export class WarehouseCatalogue implements IWarehouseCatalogue {
    readonly id: NonNullable<string>;
    warehouseId: string;
    catalogueId: string;
    stock: number;
    unlimitedStock: boolean;
    status: EStatus;
    catalogoue: Catalogue;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IWarehouseCatalogue) {}
}
