import { TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IVehicleAccessibility extends ITimestamp {
    id: string;
    name: string;
}

export class VehicleAccessibility extends Timestamp implements IVehicleAccessibility {
    constructor(
        public id: string,
        public name: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
    }
}
