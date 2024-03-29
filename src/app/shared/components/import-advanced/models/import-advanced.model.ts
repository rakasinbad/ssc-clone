import { ButtonDesignType } from 'app/shared/models/button.model';
import { IDialogConfig } from 'app/shared/models/dialog.model';
import { TNullable } from 'app/shared/models/global.model';
import { ITab } from 'app/shared/models/tab.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { User } from 'app/shared/models/user.model';

export interface IButtonImportConfig {
    readonly id: NonNullable<string>;
    color?: string;
    cssClass?: string | Array<string>;
    dialogConf: IDialogConfig;
    title: string;
    type: ButtonDesignType;
}

export interface IDialogData {
    dialog: {
        title: string;
        cssToolbar: string | Array<string>;
    };
    pageType: string;
    formConfig: any;
    tabConfig: Array<ITab>;
}

export interface IImportAdvanced {
    file: NonNullable<File>;
    page: string;
    type: NonNullable<string>;
    endpoint: NonNullable<string>;
    fileType?: string; /** fileType(optional) digunakan untuk mengubah error message */
}

export type TemplateType = 'CREATE' | 'UPDATE';

export interface IConfigMode {
    id: string;
    label: string;
    fileType?: string;  /** fileType(optional) digunakan untuk mengubah error message */
}

export interface IConfigTemplateSource {
    name: string;
    fileUrl: string;
    type: string;
}

export interface IConfigTemplate {
    type: string;
    sources: Array<IConfigTemplateSource>;
}

export interface IConfigImportAdvanced {
    mode: Array<IConfigMode>;
    template: Array<IConfigTemplate>;
}

export interface IImportLog extends ITimestamp {
    readonly id: NonNullable<string>;
    action: string;
    fileName: string;
    page: string;
    processedRow: number;
    status: string;
    totalRow: number;
    url: string;
    user: User;
    userId: string;
}

export class ImportLog implements IImportLog {
    readonly id: NonNullable<string>;
    action: string;
    fileName: string;
    page: string;
    processedRow: number;
    status: string;
    totalRow: number;
    url: string;
    user: User;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IImportLog) {
        const {
            id,
            action,
            fileName,
            page,
            processedRow,
            status,
            totalRow,
            url,
            user,
            userId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id || undefined;
        this.action = String(action).trim() || null;
        this.fileName = String(fileName).trim() || null;
        this.page = String(page).trim() || null;
        this.processedRow = processedRow;
        this.status = String(status).trim() || null;
        this.totalRow = totalRow;
        this.url = String(url).trim() || null;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setUser = user;
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }
}

export interface IExportLog extends ITimestamp {
    readonly id: NonNullable<string>;
    action: string;
    page: string;
    status: string;
    type: string;
    url: string;
    user: User;
    userId: string;
}

export class ExportLog implements IExportLog {
    readonly id: NonNullable<string>;
    action: string;
    page: string;
    status: string;
    type: string;
    url: string;
    user: User;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IExportLog) {
        const {
            id,
            action,
            page,
            status,
            type,
            url,
            user,
            userId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id || undefined;
        this.action = this._handleString(action);
        this.page = this._handleString(page);
        this.status = this._handleString(status);
        this.type = this._handleString(type);
        this.url = this._handleString(url);
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setUser = user;
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }

    private _handleString(value: string): string {
        return value ? String(value).trim() || null : null;
    }
}

export interface PayloadTemplateHistory {
    page: string;
    status: string;
    type: string;
    action: string;
    url: string;
    userId: string;
}
