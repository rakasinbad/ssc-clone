import {
    IResponsePaginate,
    ITimestamp,
    Timestamp,
    TNullable,
    User,
    Role
} from 'app/shared/models';

import {
    Catalogue,
    Store
} from './index';

enum EStoreCatalogueStatus {
    active,
    inactive
}

interface IStoreCatalogue {
    id: string;
    catalogueId: string;
    storeId: string;
    status: EStoreCatalogueStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}


export class StoreCatalogue implements IStoreCatalogue {
    id: string;
    catalogueId: string;
    storeId: string;
    status: EStoreCatalogueStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    catalogue?: Catalogue;
    store?: Store;
    currentStock?: number;
    totalPrice?: number;

    constructor(
        id: string,
        catalogueId: string,
        storeId: string,
        status: EStoreCatalogueStatus,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>,
    ) {
        this.id = id;
        this.catalogueId = catalogueId;
        this.storeId = storeId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setCatalogue(catalogue: Catalogue) {
        if (catalogue) {
            this.catalogue = new Catalogue(
                this.catalogue.id,
                this.catalogue.name,
                this.catalogue.barcode,
                this.catalogue.information,
                this.catalogue.description,
                this.catalogue.detail,
                this.catalogue.color,
                this.catalogue.weight,
                this.catalogue.dimension,
                this.catalogue.sku,
                this.catalogue.skuRef,
                this.catalogue.productPrice,
                this.catalogue.suggestRetailPrice,
                this.catalogue.minQty,
                this.catalogue.packagedQty,
                this.catalogue.multipleQty,
                this.catalogue.displayStock,
                this.catalogue.stock,
                this.catalogue.hazardLevel,
                this.catalogue.forSale,
                this.catalogue.unitOfMeasureId,
                this.catalogue.purchaseUnitOfMeasure,
                this.catalogue.status,
                this.catalogue.principalId,
                this.catalogue.catalogueTaxId,
                this.catalogue.catalogueVariantId,
                this.catalogue.brandId,
                this.catalogue.firstCatalogueCategoryId,
                this.catalogue.lastCatalogueCategoryId,
                this.catalogue.catalogueTypeId,
                this.catalogue.createdAt,
                this.catalogue.updatedAt,
                this.catalogue.deletedAt,
                this.catalogue.catalogueCategoryId,
                this.catalogue.catalogueUnitId,
                this.catalogue.catalogueImages,
                this.catalogue.catalogueTax,
                this.catalogue.firstCatalogueCategory,
                this.catalogue.lastCatalogueCategory,
                this.catalogue.catalogueKeywordCatalogues,
                this.catalogue.catalogueType,
                this.catalogue.catalogueUnit,
                this.catalogue.catalogueVariant,
                this.catalogue.externalId
            );
        }
    }

    set setStore(store: Store) {
        if (store) {
            this.store = new Store(
                this.store.id,
                this.store.storeCode,
                this.store.name,
                this.store.address,
                this.store.taxNo,
                this.store.longitude,
                this.store.latitude,
                this.store.largeArea,
                this.store.phoneNo,
                this.store.imageUrl,
                this.store.taxImageUrl,
                this.store.status,
                this.store.reason,
                this.store.parent,
                this.store.parentId,
                this.store.numberOfEmployee,
                this.store.externalId,
                this.store.storeTypeId,
                this.store.storeGroupId,
                this.store.storeSegmentId,
                this.store.urbanId,
                this.store.vehicleAccessibilityId,
                this.store.warehouseId,
                this.store.userStores,
                this.store.storeType,
                this.store.storeGroup,
                this.store.storeSegment,
                this.store.urban,
                this.store.storeConfig,
                this.store.createdAt,
                this.store.updatedAt,
                this.store.deletedAt,
            );

            this.store.setSupplierStores = this.store.supplierStores;
        }
    }
}