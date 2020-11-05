import { EStatus } from 'app/shared/models/global.model';

export interface CatalogueProps {
    readonly id: NonNullable<string>;
    externalId: string;
    isBonus: boolean;
    name: string;
    sku: string;
    status: EStatus;
}

export class Catalogue implements CatalogueProps {
    readonly id: NonNullable<string>;
    externalId: string;
    isBonus: boolean;
    name: string;
    sku: string;
    status: EStatus;

    constructor(data: CatalogueProps) {
        const { id, externalId, isBonus, name, sku, status } = data;

        this.id = id;
        this.externalId = externalId && externalId.trim();
        this.isBonus = isBonus;
        this.name = name && name.trim();
        this.sku = sku && sku.trim();
        this.status = status;
    }
}
