import { EStatus, TNullable } from 'app/shared/models/global.model';

export class SkpLinkedList {
    readonly id: NonNullable<string>;
    count: string;
    supplier_id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    deleted_at: TNullable<string>;

    constructor(data: SkpLinkedList) {
        const {
            id,
            count,
            supplier_id,
            name,
            start_date,
            end_date,
            deleted_at
        } = data

        this.id = id;
        this.count = count || null;
        this.supplier_id = supplier_id;
        this.name = name ? String(name).trim() : null;
        this.start_date = start_date;
        this.end_date = end_date;
        this.status = status;
        this.deleted_at = deleted_at;
    }
}