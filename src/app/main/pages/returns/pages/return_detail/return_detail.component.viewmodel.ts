import { IDocumentInfoData } from '../../component/document_info';
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
}
