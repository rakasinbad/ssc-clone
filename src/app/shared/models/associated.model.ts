import { TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';

export interface IAssociated extends ITimestamp {
    readonly id: NonNullable<string>;
    portfolioId: string;
    userIdAfter: string;
    userIdBefore: string;
}

export class Associated implements IAssociated {
    readonly id: NonNullable<string>;
    portfolioId: string;
    userIdAfter: string;
    userIdBefore: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IAssociated) {
        const {
            id,
            portfolioId,
            userIdAfter,
            userIdBefore,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.portfolioId = portfolioId;
        this.userIdAfter = userIdAfter;
        this.userIdBefore = userIdBefore;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
