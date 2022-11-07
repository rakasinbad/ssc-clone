import { ExportConfigurationPage } from "./export-filter.model";
import { IQueryParams, IQueryParamsMedeaGo } from 'app/shared/models/query.model';
import { ExportConfiguration } from './index';

export type TExportHistoryType = 'Data' | 'Invoice';

type TExportHistoryStatus = 'Pending' | 'Error' | 'Download';

export type TExportHistoryAction = '' | 'export_fms' | 'export_invoices' | 'export_returns';

export interface IExportHistoryPage {
    page: ExportConfigurationPage;
    tab: TExportHistoryAction;
    useMedeaGo?: boolean;
}

export interface IExportHistoryRequest extends IQueryParams, Omit<IQueryParamsMedeaGo, 'page'>, ExportConfiguration {
    action: TExportHistoryAction;
    useMedaGo?: boolean;
    pageIndex?: number;
}

export interface IPeriod {
    start: string;
    end: string;
}

export interface IExportHistory {
    user: string;
    period: string & IPeriod;
    createdAt: string;
    type: TExportHistoryType;
    progress: TExportHistoryStatus;
    downloadUrl: string;
    status?: string;
    url?: string;
}

export class ExportHistory implements IExportHistory {
    user: string;
    period: string & IPeriod;
    createdAt: string;
    type: TExportHistoryType;
    progress: TExportHistoryStatus;
    downloadUrl: string;
    status: string;
    url: string;

    constructor(data: IExportHistory) {
        const { user, period, createdAt, type, progress, downloadUrl, status, url } = data;

        this.user = user;
        this.period = period;
        this.createdAt = createdAt;
        this.type = type;
        this.progress = progress;
        this.downloadUrl = downloadUrl;
        this.status = status;
        this.url = url;
    }
}
