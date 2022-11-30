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

export function getReturnStatusTitle(status: string): string {
    switch (status) {
        case 'created':
            return 'Created';
        case 'pending':
            return 'Requested';
        case 'approved':
            return 'Approved';
        case 'approved_returned':
            return 'Returned';
        case 'rejected':
            return 'Rejected';
        case 'closed':
            return 'Closed';
        default:
            return status;
    }
}

export function getReturnStatusDescription(status: string): string {
    switch (status) {
        case 'created':
            return 'create';
        case 'pending':
            return 'request';
        case 'approved':
            return 'approve';
        case 'approved_returned':
            return 'return';
        case 'rejected':
            return 'reject';
        case 'closed':
            return 'close';
        default:
            return status;
    }
}
