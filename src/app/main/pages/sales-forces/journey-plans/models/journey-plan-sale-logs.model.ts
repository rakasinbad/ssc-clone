import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { NoOrderReasons } from './no-order-reasons.model';

export interface IJourneyPlanSaleLogs extends ITimestamp {
    readonly id: NonNullable<string>;
    activity: string,
    noOrderNotes: string,
    noOrderReasons: NoOrderReasons,
}

export class JourneyPlanSaleLogs implements IJourneyPlanSaleLogs {
    readonly id: NonNullable<string>;
    activity: string;
    noOrderNotes: string;
    noOrderReasons: NoOrderReasons;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IJourneyPlanSaleLogs) {
        const { id, activity, noOrderNotes, noOrderReasons, createdAt, updatedAt, deletedAt, } = data;

        this.id = id;
        this.activity = activity;
        this.noOrderNotes = noOrderNotes;
        this.noOrderReasons = noOrderReasons;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
