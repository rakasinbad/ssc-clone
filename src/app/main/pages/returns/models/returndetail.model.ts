export interface IReturnDetailLog {
    id: number | string;
    status: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface IReturnCatalogue {
    id: string | number;
    catalogueId: string | number;
    name: string;
    qty: number;
    imageUrl: string;
    unitPrice: number;
    sumPrice: number;
    returnReasonId: string | number;
    reason: string;
    note: string;
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
    amount: number;
    returns: Array<IReturnCatalogue>;
    returnParcelLogs: Array<IReturnDetailLog> | null;
}
