import { SupplierStore } from 'app/shared/models/supplier.model';

interface IVoucherSegmentationSettings {
    id?: string;
    segmentationBase: string;
    chosenStore?: Array<SupplierStore>;
    // chosenWarehouse?: Array<Warehouse>;
    // chosenStoreType?: Array<StoreSegmentationType>;
    // chosenStoreGroup?: Array<StoreSegmentationGroup>;
    // chosenStoreChannel?: Array<StoreSegmentationChannel>;
    // chosenStoreCluster?: Array<StoreSegmentationCluster>;
}

export class VoucherSegmentationSettings implements IVoucherSegmentationSettings {
    id?: string;
    segmentationBase: string;
    chosenStore?: Array<SupplierStore>;
    // chosenWarehouse?: Array<Warehouse>;
    // chosenStoreType?: Array<StoreSegmentationType>;
    // chosenStoreGroup?: Array<StoreSegmentationGroup>;
    // chosenStoreChannel?: Array<StoreSegmentationChannel>;
    // chosenStoreCluster?: Array<StoreSegmentationCluster>;

    constructor(data: IVoucherSegmentationSettings) {
        const {
            id,
            segmentationBase,
            chosenStore = [],
            // chosenWarehouse = [],
            // chosenStoreType = [],
            // chosenStoreGroup = [],
            // chosenStoreChannel = [],
            // chosenStoreCluster = [],
        } = data;

        this.id = id;
        this.segmentationBase = segmentationBase;
        this.chosenStore = chosenStore;
        // this.chosenWarehouse = chosenWarehouse;
        // this.chosenStoreType = chosenStoreType;
        // this.chosenStoreGroup = chosenStoreGroup;
        // this.chosenStoreChannel = chosenStoreChannel;
        // this.chosenStoreCluster = chosenStoreCluster;
    }
}
