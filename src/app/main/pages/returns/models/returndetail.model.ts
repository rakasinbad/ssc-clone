export interface IReturnDetailLog {
    id: number | string;
    status: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface IReturnCatalogue {
    id?: string | number;
    catalogueId?: string | number;
    externalId?: string | number;
    name?: string;
    deliveredQty?: number;
    returnQty?: number;
    approvedReturnQty?: number;
    approvedUnitPrice?: number;
    imageUrl?: string;
    unitPrice?: number;
    totalPrice?: number;
    returnReasonId?: string | number;
    returnReason?: string;
    note?: string;
}

export enum IStepKey {
    created = "created",
    pending = "pending",
    approved = "approved",
    approved_returned = "approved_returned",
    rejected = "rejected",
    closed = "closed"
};

export interface IStep {
    by: string;
    date: string;
}

export type ISteps = {
    [key in IStepKey]: IStep
}

export interface IReturnDetail {
    id?: string | number;
    returnsQty?: number;
    returnParcelId: string | number;
    returnNumber: string;
    userId: number | string;
    userName: string;
    storeId: number | string;
    storeName: string;
    storeAddress?: string;
    status: string;
    createdAt: string;
    returned: boolean;
    totalAmount: number;
    returns?: Array<IReturnCatalogue>;
    returnItems?: Array<IReturnCatalogue>; /** V2 */
    returnParcelLogs: Array<IReturnDetailLog> | null;
    orderCode: string;
    orderParcelId: string;
    steps: ISteps;
}

export interface IReturnAmount {
    returnQty: number;
    returnAmount: number;
    returnItems: Array<IReturnCatalogue>; /** V2 */
}

export interface IConfirmChangeQuantityReturn { 
    status: string; 
    id: number|string; 
    returnNumber?: string; 
    returned?: boolean; 
    tableData: Array<IReturnCatalogue> 
}

export interface IReturnItemsFormData {
    id: string | number; 
    approvedQty: number; 
    approvedUnitPrice: number ;
}

export interface IChangeStatusReturn {
    status: string; 
    returnItems?: Array<IReturnItemsFormData>; 
}

export interface IConfirmChangeStatusReturn extends Partial<IConfirmChangeQuantityReturn> { 
    change: IChangeStatusReturn;
}
