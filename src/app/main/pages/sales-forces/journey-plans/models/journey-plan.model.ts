import { User, TNullable, ITimestamp } from 'app/shared/models';

export interface IJourneyPlan extends ITimestamp {
    readonly id: NonNullable<string>;
    date: string;
    user: User;
    userId: string;
}

export class JourneyPlan implements IJourneyPlan {
    readonly id: NonNullable<string>;
    date: string;
    user: User;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IJourneyPlan) {
        const { id, date, user, userId, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.date = date;
        this.setUser = user;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }
}
