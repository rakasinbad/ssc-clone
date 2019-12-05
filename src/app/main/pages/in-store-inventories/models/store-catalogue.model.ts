import { IResponsePaginate, ITimestamp, Timestamp, TNullable, User, Role } from 'app/shared/models';

import { Catalogue, Store } from './index';

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
        deletedAt: TNullable<string>
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
            this.catalogue = new Catalogue(this.catalogue);
        }
    }

    set setStore(store: Store) {
        if (store) {
            this.store = new Store(store);
        }
    }
}
