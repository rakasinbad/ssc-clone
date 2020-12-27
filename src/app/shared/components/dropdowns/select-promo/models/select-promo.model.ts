import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface ISelectPromo extends ITimestamp {
    id: string
    name: string
    createdAt: string
    updatedAt: string
    deletedAt: TNullable<string>
}

export class SelectPromo implements ISelectPromo {
    id: string
    name: string
    createdAt: string
    updatedAt: string
    deletedAt: TNullable<string>

    constructor(data: ISelectPromo) {
        const {
            id,
            name,
            createdAt,
            updatedAt,
            deletedAt
        } = data

        this.id = id
        this.name = name
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}