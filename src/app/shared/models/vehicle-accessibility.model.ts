import { TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IVehicleAccessibility extends ITimestamp {
    id: string;
    name: string;
}

export class VehicleAccessibility extends Timestamp implements IVehicleAccessibility {
    constructor(
        private _id: string,
        private _name: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }
}
