export interface IPayloadStockManagementCatalogue {
    qtyChange: number;
    unlimitedStock: boolean;
    warehouseCatalogueId: string;
    warehouseCatalogueReasonId: string;
}

export class PayloadStockManagementCatalogue implements IPayloadStockManagementCatalogue {
    qtyChange: number;
    unlimitedStock: boolean;
    warehouseCatalogueId: string;
    warehouseCatalogueReasonId: string;

    constructor(data: IPayloadStockManagementCatalogue) {
        const {
            qtyChange,
            unlimitedStock,
            warehouseCatalogueId,
            warehouseCatalogueReasonId
        } = data;

        this.qtyChange = qtyChange;
        this.unlimitedStock = unlimitedStock;
        this.warehouseCatalogueId = warehouseCatalogueId;
        this.warehouseCatalogueReasonId = warehouseCatalogueReasonId;
    }

    clear(): PayloadStockManagementCatalogue {
        return new PayloadStockManagementCatalogue(undefined);
    }
}
