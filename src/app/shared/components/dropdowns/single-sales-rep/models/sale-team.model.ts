import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface ISaleTeam extends ITimestamp {
    id: string;
    name: string;
    supplierId: string;
}

export class SaleTeam implements ISaleTeam {
    id: string;
    name: string;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: ISaleTeam) {
        const {
            id,
            name,
            supplierId,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.name = name;
        this.supplierId = supplierId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

