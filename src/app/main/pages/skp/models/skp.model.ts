import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { EStatus, TNullable } from 'app/shared/models/global.model';


export class SkpModel {
    readonly id: NonNullable<string>;
    name: string;
    description: string;
    endDate: string;
    startDate: string;
    notes: string;
    header: string;
    imageUrl: string;
    file: string;
    status: EStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: SkpModel) {
        const {
            id,
            name,
            description,
            endDate,
            startDate,
            notes,
            header,
            imageUrl,
            file,
            status,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.name = name ? String(name).trim() : null;
        this.description = description;
        this.endDate = endDate;
        this.startDate = startDate;
        this.notes = notes || null;
        this.header = header || null;
        this.imageUrl = imageUrl || null;
        this.file = file || null;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
