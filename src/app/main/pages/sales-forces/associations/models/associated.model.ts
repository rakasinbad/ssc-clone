import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IAssociated extends ITimestamp {
    id: string;
    portfolioId: string;
    userIdBefore: string;
    userIdAfter: string;
    user_id_after: string;
    user_id_before: string;
}

export class Associated implements IAssociated {
    id: string;
    portfolioId: string;
    userIdBefore: string;
    userIdAfter: string;
    // tslint:disable-next-line: variable-name
    user_id_after: string;
    // tslint:disable-next-line: variable-name
    user_id_before: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: IAssociated) {
        const {
            id,
            portfolioId,
            userIdBefore,
            userIdAfter,
            user_id_after,
            user_id_before,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.portfolioId = portfolioId;
        this.userIdBefore = userIdBefore;
        this.userIdAfter = userIdAfter;
        this.user_id_after = user_id_after;
        this.user_id_before = user_id_before;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
