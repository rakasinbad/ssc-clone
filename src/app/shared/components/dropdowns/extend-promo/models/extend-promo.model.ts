import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IExtendPromo extends ITimestamp {
    id: string
    start_date: string
    end_date: string
    new_start_date: string
    new_end_date: string
    status: string
    createdAt: string
    updatedAt: string
    deletedAt: TNullable<string>
}

export class ExtendPromo implements IExtendPromo {
    id: string
    start_date: string
    end_date: string
    new_start_date: string
    new_end_date: string
    status: string
    createdAt: string
    updatedAt: string
    deletedAt: TNullable<string>

    constructor(data: IExtendPromo) {
        const {
            id,
            start_date,
            end_date,
            new_start_date,
            new_end_date,
            status,
            createdAt,
            updatedAt,
            deletedAt
        } = data

        this.id = id
        this.start_date = start_date
        this.end_date = end_date
        this.new_start_date = new_start_date
        this.new_end_date = new_end_date
        this.status = status
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}