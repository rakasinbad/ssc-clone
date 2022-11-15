import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
// import { StoreSegmentationGroup, StoreSegmentationChannel, StoreSegmentationCluster } from 'app/main/pages/catalogues/models';
import { SupplierStore } from 'app/shared/models/supplier.model';
// import { Warehouse } from 'app/main/pages/logistics/warehouse-coverages/models/warehouse-coverage.model';

interface IPeriodTargetPromoCustomerSegmentationSettings {
    id?: string;
    segmentationBase: string;
    chosenStore?: Array<SupplierStore>;
    chosenWarehouse?: Array<any>;
    chosenStoreType?: Array<StoreSegmentationType>;
    chosenStoreGroup?: Array<any>;
    chosenStoreChannel?: Array<any>;
    chosenStoreCluster?: Array<any>;
}

export class PeriodTargetPromoCustomerSegmentationSettings implements IPeriodTargetPromoCustomerSegmentationSettings {
    id?: string;
    segmentationBase: string;
    chosenStore?: Array<SupplierStore>;
    chosenWarehouse?: Array<any>;
    chosenStoreType?: Array<StoreSegmentationType>;
    chosenStoreGroup?: Array<any>;
    chosenStoreChannel?: Array<any>;
    chosenStoreCluster?: Array<any>;

    constructor(data: IPeriodTargetPromoCustomerSegmentationSettings) {
        const {
            id,
            segmentationBase,
            chosenStore = [],
            chosenWarehouse = [],
            chosenStoreType = [],
            chosenStoreGroup = [],
            chosenStoreChannel = [],
            chosenStoreCluster = [],
        } = data;

        this.id = id;
        this.segmentationBase = segmentationBase;
        this.chosenStore = chosenStore;
        this.chosenWarehouse = chosenWarehouse;
        this.chosenStoreType = chosenStoreType;
        this.chosenStoreGroup = chosenStoreGroup;
        this.chosenStoreChannel = chosenStoreChannel;
        this.chosenStoreCluster = chosenStoreCluster;
    }
}
