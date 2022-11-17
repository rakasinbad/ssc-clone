import { IReturnCatalogue } from "./returndetail.model";

export interface IReturnAmount {
    returnQty: number;
    returnAmount: number;
    returnItems: IReturnCatalogue[]
}