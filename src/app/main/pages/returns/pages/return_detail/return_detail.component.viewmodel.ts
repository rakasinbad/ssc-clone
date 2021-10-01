import { IDocumentInfoData } from '../../component/document_info';
import { IReturnCatalogue } from '../../models/returndetail.model';

export interface ReturnDetailComponentViewModel {
    returnNumber: number | string;
    storeName: string;
    storeInfo: Array<IDocumentInfoData>;
    dateInfo: Array<IDocumentInfoData>;
    returnInfo: Array<IDocumentInfoData>;
    returnLines: Array<IReturnCatalogue>;
    totalReturnLine: number;
    returnSummaries: Array<IDocumentInfoData>;
}
