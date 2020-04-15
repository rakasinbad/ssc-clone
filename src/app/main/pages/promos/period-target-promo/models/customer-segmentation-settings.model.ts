import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
import { StoreSegmentationGroup, StoreSegmentationChannel, StoreSegmentationCluster } from 'app/main/pages/catalogues/models';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { Warehouse } from 'app/main/pages/logistics/warehouse-coverages/models/warehouse-coverage.model';

interface IPeriodTargetPromoCustomerSegmentationSettings {
    id?: string;
    base: string;
    chosenStore?: Array<SupplierStore>;
    chosenWarehouse?: Array<Warehouse>;
    chosenStoreType?: Array<StoreSegmentationType>;
    chosenStoreGroup?: Array<StoreSegmentationGroup>;
    chosenStoreChannel?: Array<StoreSegmentationChannel>;
    chosenStoreCluster?: Array<StoreSegmentationCluster>;
}

export class PeriodTargetPromoCustomerSegmentationSettings implements IPeriodTargetPromoCustomerSegmentationSettings {
    id?: string;
    base: string;
    chosenStore?: Array<SupplierStore>;
    chosenWarehouse?: Array<Warehouse>;
    chosenStoreType?: Array<StoreSegmentationType>;
    chosenStoreGroup?: Array<StoreSegmentationGroup>;
    chosenStoreChannel?: Array<StoreSegmentationChannel>;
    chosenStoreCluster?: Array<StoreSegmentationCluster>;

    constructor(data: IPeriodTargetPromoCustomerSegmentationSettings) {
        const {
            id,
            base,
            chosenStore = [],
            chosenWarehouse = [],
            chosenStoreType = [],
            chosenStoreGroup = [],
            chosenStoreChannel = [],
            chosenStoreCluster = [],
        } = data;

        this.id = id;
        this.base = base;
        this.chosenStore = chosenStore;
        this.chosenWarehouse = chosenWarehouse;
        this.chosenStoreType = chosenStoreType;
        this.chosenStoreGroup = chosenStoreGroup;
        this.chosenStoreChannel = chosenStoreChannel;
        this.chosenStoreCluster = chosenStoreCluster;
    }
}
