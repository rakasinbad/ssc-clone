import { TNullable, TStatus } from './global.model';
import { Timestamp } from './timestamp.model';

export class CustomerHierarchy extends Timestamp {
    id: string;
    name: string;
    status: TStatus;
    brandId: string;

    constructor(
        id: string,
        name: string,
        status: TStatus,
        brandId: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.name = name;
        this.status = status;
        this.brandId = brandId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class CustomerHierarchyAssoc extends Timestamp {
    id: string;
    storeId: string;
    hierarchyId: string;
    status: TStatus;
    hierarchy: CustomerHierarchy;

    constructor(
        id: string,
        storeId: string,
        hierarchyId: string,
        status: TStatus,
        hierarchy: CustomerHierarchy,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.storeId = storeId;
        this.hierarchyId = hierarchyId;
        this.status = status;
        this.hierarchy = hierarchy
            ? {
                  ...new CustomerHierarchy(
                      hierarchy.id,
                      hierarchy.name,
                      hierarchy.status,
                      hierarchy.brandId,
                      hierarchy.createdAt,
                      hierarchy.updatedAt,
                      hierarchy.deletedAt
                  )
              }
            : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
