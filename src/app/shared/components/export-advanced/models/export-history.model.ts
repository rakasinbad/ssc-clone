import { ExportConfigurationPage } from "./export-filter.model";
import { IQueryParams } from 'app/shared/models/query.model';
import { ExportConfiguration } from './index';

export type TExportHistoryType = 'Data' | 'Invoice';

type TExportHistoryStatus = 'Pending' | 'Error' | 'Download';

export type TExportHistoryAction = '' | 'export_fms' | 'export_invoices';

export interface IExportHistoryPage {
    page: ExportConfigurationPage;
    tab: TExportHistoryAction;
}

export interface IExportHistoryRequest extends IQueryParams, ExportConfiguration {
    action: TExportHistoryAction
}

export interface IExportHistory {
    user: string;
    period: string;
    createdAt: string;
    type: TExportHistoryType;
    progress: TExportHistoryStatus;
    downloadUrl: string;
}

export class ExportHistory implements IExportHistory {
    user: string;
    period: string;
    createdAt: string;
    type: TExportHistoryType;
    progress: TExportHistoryStatus;
    downloadUrl: string;

    constructor(data: IExportHistory) {
        const { user, period, createdAt, type, progress, downloadUrl } = data;

        this.user = user;
        this.period = period;
        this.createdAt = createdAt;
        this.type = type;
        this.progress = progress;
        this.downloadUrl = downloadUrl;
    }
}
