import { EStatus, TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IPaymentType extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    iconUrl: string;
    terms: string;
    description: string;
    status: EStatus;
}

export class PaymentType extends Timestamp implements IPaymentType {
    constructor(
        public readonly id: NonNullable<string>,
        public name: string,
        public iconUrl: string,
        public terms: string,
        public description: string,
        public status: EStatus,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
        this.iconUrl = iconUrl ? iconUrl.trim() : null;
        this.terms = terms ? terms.trim() : null;
        this.description = description ? description.trim() : null;
        this.status = status ? status : EStatus.INACTIVE;
    }
}
