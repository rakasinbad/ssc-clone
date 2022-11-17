import { StepConfig } from 'app/shared/components/react-components/Stepper/partials';
import { IDocumentInfoData } from '../../component/document_info';
import { DocumentLogItemViewModel } from '../../component/document_log';
import { IReturnCatalogue } from '../../models/returndetail.model';

export interface ReturnDetailComponentViewModel {
    title: string;
    returnNumber: number | string;
    storeName: string;
    status: string;
    returned: boolean | null;
    storeInfo: Array<IDocumentInfoData>;
    dateInfo: Array<IDocumentInfoData>;
    returnInfo: Array<IDocumentInfoData>;
    returnLines: Array<IReturnCatalogue>;
    totalReturnLine: number;
    returnSummaries: Array<IDocumentInfoData>;
    returnLogs: Array<DocumentLogItemViewModel> | null;
    returnLogsV2: Array<StepConfig> | null;
}
