import { Timestamp } from './timestamp.model';
import { TNullable } from './global.model';

export class Province extends Timestamp {
    id: string;
    name: string;

    constructor(
        id: string,
        name: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.name = name ? name.trim() : name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
