import { TNullable, TStatus } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';
import { Urban } from './urban.model';

interface IBrand extends ITimestamp {
    id: string;
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    phoneNo: string;
    imageUrl: TNullable<string>;
    official: boolean;
    status: TStatus;
    urbanId: string;
    urban?: Urban;
}

export class Brand extends Timestamp implements IBrand {
    public urban?: Urban;

    constructor(
        public id: string,
        public name: string,
        public address: string,
        public longitude: number,
        public latitude: number,
        public phoneNo: string,
        public imageUrl: TNullable<string>,
        public official: boolean,
        public status: TStatus,
        public urbanId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
        this.address = address ? address.trim() : null;
        this.phoneNo = phoneNo ? phoneNo.trim() : null;
        this.imageUrl = imageUrl ? imageUrl.trim() : null;
    }

    set setUrban(value: Urban) {
        this.urban = value ? new Urban(value) : null;
    }
}
