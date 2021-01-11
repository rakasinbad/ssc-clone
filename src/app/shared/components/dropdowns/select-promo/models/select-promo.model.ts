import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface ISelectPromo extends ITimestamp {
    id: string
    name: string
    count: string
    supplier_id: string
    start_date: string
    end_date: string
    status: string
    createdAt: string
    updatedAt: string
    deletedAt: TNullable<string>
}

export class SelectPromo implements ISelectPromo {
    id: string
    name: string
    count: string
    supplier_id: string
    start_date: string
    end_date: string
    status: string
    createdAt: string
    updatedAt: string
    deletedAt: TNullable<string>

    constructor(data: ISelectPromo) {
        const {
            id,
            name,
            count,
            supplier_id,
            start_date,
            end_date,
            status,
            createdAt,
            updatedAt,
            deletedAt
        } = data

        this.id = id
        this.name = name
        this.count = count
        this.supplier_id = supplier_id
        this.start_date = start_date
        this.end_date = end_date
        this.status = status
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}