import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IPortfolioHistory extends ITimestamp {
    id: string;
    portfolioId: string;
    userIdBefore: string;
    userIdAfter: string;
    user_id_after: string;
    user_id_before: string;
}

export class PortfolioHistory implements IPortfolioHistory {
    id: string;
    portfolioId: string;
    userIdBefore: string;
    userIdAfter: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    // tslint:disable-next-line: variable-name
    user_id_after: string;
    // tslint:disable-next-line: variable-name
    user_id_before: string;

    constructor(data: IPortfolioHistory) {
        const {
            id,
            portfolioId,
            userIdBefore,
            userIdAfter,
            createdAt,
            updatedAt,
            deletedAt,
            user_id_after,
            user_id_before,
        } = data;

        this.id = id;
        this.portfolioId = portfolioId;
        this.userIdBefore = userIdBefore;
        this.userIdAfter = userIdAfter;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.user_id_after = user_id_after;
        this.user_id_before = user_id_before;
    }
}
