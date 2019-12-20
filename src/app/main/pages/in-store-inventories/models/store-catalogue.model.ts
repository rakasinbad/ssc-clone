import { TNullable, User } from 'app/shared/models';
import { Catalogue, Store } from './index';

interface ICondition {
    id: string;
    name: string;
    method: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export class Condition implements ICondition {
    id: string;
    name: string;
    method: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: ICondition) {
        const {
            id,
            name,
            method,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.name = name;
        this.method = method;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

interface IStoreCatalogue {
    id: string;
    catalogueId: string;
    storeId: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    catalogue?: Catalogue;
    store?: Store;
    currentStock?: number;
    totalPrice?: number;
}

export class StoreCatalogue implements IStoreCatalogue {
    id: string;
    catalogueId: string;
    storeId: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    catalogue?: Catalogue;
    store?: Store;
    currentStock?: number;
    totalPrice?: number;

    constructor(data: IStoreCatalogue) {
        const {
            id,
            catalogueId,
            storeId,
            status,
            createdAt,
            updatedAt,
            deletedAt,
            catalogue,
            store,
            currentStock,
            totalPrice,
        } = data;

        this.id = id;
        this.catalogueId = catalogueId;
        this.storeId = storeId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.catalogue = new Catalogue(catalogue);
        this.store = new Store(store);
        this.currentStock = currentStock;
        this.totalPrice = totalPrice;
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

interface IStoreHistoryInventory {
    id: string;
    addition: number;
    subtraction: TNullable<number>;
    notes: TNullable<string>;
    source: string;
    sourceNumber: string;
    storeCatalogueId: string;
    conditionId: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    creator?: User;
    condition?: Condition;
    storeCatalogue?: StoreCatalogue;
}

export class StoreHistoryInventory implements IStoreHistoryInventory {
    id: string;
    addition: number;
    subtraction: TNullable<number>;
    notes: TNullable<string>;
    source: string;
    sourceNumber: string;
    storeCatalogueId: string;
    conditionId: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    creator?: User;
    condition?: Condition;
    storeCatalogue?: StoreCatalogue;

    constructor(data: IStoreHistoryInventory) {
        const {
            id,
            addition,
            subtraction,
            notes,
            source,
            sourceNumber,
            storeCatalogueId,
            conditionId,
            creatorId,
            createdAt,
            updatedAt,
            deletedAt,
            creator,
            condition,
            storeCatalogue,
        } = data;

        this.id = id;
        this.addition = addition;
        this.subtraction = subtraction;
        this.notes = notes;
        this.source = source;
        this.sourceNumber = sourceNumber;
        this.storeCatalogueId = storeCatalogueId;
        this.conditionId = conditionId;
        this.creatorId = creatorId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.creator = new User(
            creator.id,
            creator.fullName,
            creator.email,
            creator.phoneNo,
            creator.mobilePhoneNo,
            creator.idNo,
            creator.taxNo,
            creator.status,
            creator.imageUrl,
            creator.taxImageUrl,
            creator.idImageUrl,
            creator.selfieImageUrl,
            creator.urbanId,
            creator.roles,
            creator.createdAt,
            creator.updatedAt,
            creator.deletedAt,
        );
        this.condition = new Condition(condition);
        this.storeCatalogue = new StoreCatalogue(storeCatalogue);
    }
}
