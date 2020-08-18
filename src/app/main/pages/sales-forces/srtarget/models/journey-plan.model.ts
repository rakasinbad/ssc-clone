import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { User } from 'app/shared/models/user.model';

import { JourneyPlanSales } from './journey-plan-sales.model';

export interface IJourneyPlan extends ITimestamp {
    readonly id: NonNullable<string>;
    date: string;
    journeyPlanSales: Array<JourneyPlanSales>;
    user: User;
    userId: string;
}

export class JourneyPlan implements IJourneyPlan {
    readonly id: NonNullable<string>;
    date: string;
    journeyPlanSales: Array<JourneyPlanSales>;
    user: User;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IJourneyPlan) {
        const { id, date, journeyPlanSales, user, userId, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.date = date;
        this.setJourneyPlanSales = journeyPlanSales;
        this.setUser = user;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setJourneyPlanSales(value: Array<JourneyPlanSales>) {
        if (value && value.length > 0) {
            this.journeyPlanSales = value.map(r => new JourneyPlanSales(r));
        } else {
            this.journeyPlanSales = null;
        }
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }
}

export enum ViewBy {
    DATE = 'date',
    SALES_REP = 'sales_rep',
    STORE = 'store'
}
