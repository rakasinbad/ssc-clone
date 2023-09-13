import { TNullable } from 'app/shared/models/global.model';
import { StockManagementReason } from 'app/shared/models/stock-management-reason.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

import { StockManagementCatalogue } from './stock-management-catalogue.model';

export interface IStockManagementHistory extends ITimestamp {
    readonly id: NonNullable<string>;
    addition: number;
    subtraction: number;
    warehouseCatalogue: StockManagementCatalogue;
    warehouseCatalogueId: string;
    warehouseCatalogueReason: StockManagementReason;
    warehouseCatalogueReasonId: string;
}

export class StockManagementHistory implements IStockManagementHistory {
    readonly id: NonNullable<string>;
    addition: number;
    subtraction: number;
    warehouseCatalogue: StockManagementCatalogue;
    warehouseCatalogueId: string;
    warehouseCatalogueReason: StockManagementReason;
    warehouseCatalogueReasonId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStockManagementHistory) {
        const {
            id,
            addition,
            subtraction,
            warehouseCatalogue,
            warehouseCatalogueId,
            warehouseCatalogueReason,
            warehouseCatalogueReasonId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.addition = addition;
        this.subtraction = subtraction;
        this.warehouseCatalogueId = warehouseCatalogueId;
        this.warehouseCatalogueReasonId = warehouseCatalogueReasonId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setWarehouseCatalogue = warehouseCatalogue;
        this.setWarehouseCatalogueReason = warehouseCatalogueReason;
    }

    set setWarehouseCatalogue(value: StockManagementCatalogue) {
        this.warehouseCatalogue = value ? new StockManagementCatalogue(value) : null;
    }

    set setWarehouseCatalogueReason(value: StockManagementReason) {
        this.warehouseCatalogueReason = value ? new StockManagementReason(value) : null;
    }

    clear(): StockManagementHistory {
        return new StockManagementHistory(undefined);
    }
}
