import { EStatus } from 'app/shared/models/global.model';

interface SelectPromoList {
    readonly id: NonNullable<string>;
    promoName: string;
}

export class CreateSkpDto {
    name: string;
    description: string;
    notes: string;
    header: string;
    file: string;
    promo: SelectPromoList[];
    imageUrl: string;
    startDate: string;
    endDate: string;
    status: EStatus;

    constructor(data: CreateSkpDto) {
        const {
            name,
            description,
            notes,
            header,
            file,
            promo,
            imageUrl,
            startDate,
            endDate,
            status,
        } = data;

        this.name = name ? String(name).trim() : null;
        this.description = description || null;
        this.notes = notes || null;
        this.header = header || null;
        this.file = file || null;
        this.imageUrl = imageUrl || null;
        this.startDate = startDate || null;
        this.endDate = endDate || null;
        this.status = status;
        this.promo = promo || [];

    }
}

export class UpdateSkpDto {
    name?: string;
    description?: string;
    notes?: string;
    header?: string;
    file?: string;
    promo?: SelectPromoList[];
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    status?: EStatus;

    constructor(data: UpdateSkpDto) {
        const {
            name,
            description,
            notes,
            header,
            file,
            promo,
            imageUrl,
            startDate,
            endDate,
            status,
        } = data;

        if (typeof name !== 'undefined') {
            this.name = name;
        }

        if (typeof description !== 'undefined') {
            this.description = description;
        }

        if (typeof notes !== 'undefined') {
            this.notes = notes;
        }

        if (typeof header !== 'undefined') {
            this.header = header;
        }

        if (typeof file !== 'undefined') {
            this.file = file;
        }

        if (typeof promo !== 'undefined') {
            this.promo = promo;
        }

        if (typeof imageUrl !== 'undefined') {
            this.imageUrl = imageUrl;
        }

        if (typeof startDate !== 'undefined') {
            this.startDate = startDate;
        }

        if (typeof endDate !== 'undefined') {
            this.endDate = endDate;
        }

        if (typeof status !== 'undefined') {
            this.status = status;
        }

    }
}