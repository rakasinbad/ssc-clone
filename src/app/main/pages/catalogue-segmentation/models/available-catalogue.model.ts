export interface AvailableCatalogueProps {
    readonly id: NonNullable<string>;
    name: string;
    supplierId: string;
    type: string;
}

export class AvailableCatalogue implements AvailableCatalogueProps {
    readonly id: NonNullable<string>;
    name: string;
    supplierId: string;
    type: string;

    constructor(data: AvailableCatalogueProps) {
        const { id, name, supplierId, type } = data;

        this.id = id;
        this.name = name && name.trim();
        this.supplierId = supplierId;
        this.type = type;
    }
}
