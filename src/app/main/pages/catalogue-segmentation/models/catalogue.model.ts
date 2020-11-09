import { EStatus } from 'app/shared/models/global.model';

export interface CatalogueOfSegmentationProps {
    readonly segmentationId: NonNullable<string>;
    catalogue: Omit<CatalogueProps, 'segmentationId'>;
}

export interface CatalogueProps {
    readonly id: NonNullable<string>;
    externalId: string;
    isBonus: boolean;
    name: string;
    sku: string;
    status: EStatus;
    readonly segmentationId?: NonNullable<string>;
}

export class Catalogue implements CatalogueProps {
    readonly id: NonNullable<string>;
    externalId: string;
    isBonus: boolean;
    name: string;
    sku: string;
    status: EStatus;
    readonly segmentationId?: NonNullable<string>;

    constructor(data: CatalogueProps) {
        const { id, externalId, isBonus, name, sku, status, segmentationId } = data;

        this.id = id;
        this.externalId = externalId && externalId.trim();
        this.isBonus = isBonus;
        this.name = name && name.trim();
        this.sku = sku && sku.trim();
        this.status = status;

        if (typeof segmentationId !== 'undefined') {
            this.segmentationId = segmentationId;
        }
    }
}
