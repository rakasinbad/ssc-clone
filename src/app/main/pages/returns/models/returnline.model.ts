export interface IReturnLine {
    id: number | string;
    orderParcelId: number | string;
    returnNumber: string;
    status: string;
    amount: number;
    parcelQty: number;
    returned: boolean;
    createdAt: string;
    userName: string;
    storeName: string;
    imageUrl: string;
}