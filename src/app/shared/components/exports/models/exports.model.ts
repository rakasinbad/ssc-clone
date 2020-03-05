import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { User } from 'app/shared/models/user.model';

type TExportType = 'export' | 'export_template';

type TExportStatus = 'pending' | 'on_process' | 'error' | 'done';

interface IExport extends ITimestamp {
    id: string;
    userId: string;
    type: TExportType;
    status: TExportStatus;
    url: string;
    user: User;
}

export class Export implements IExport {
    id: string;
    userId: string;
    type: TExportType;
    status: TExportStatus;
    url: string;
    user: User;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IExport) {
        const { id, userId, type, status, url, user, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.userId = userId;
        this.type = type;
        this.status = status;
        this.url = url;
        this.user = new User(user);
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
