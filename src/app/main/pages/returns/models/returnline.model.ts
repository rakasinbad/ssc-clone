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
        case 'pending':
            return 'Pending';
        case 'approved':
            return 'Approved';
        case 'approved_returned':
            return 'Approved & Returned';
        case 'rejected':
            return 'Rejected';
        case 'closed':
            return 'Closed';
        default:
            return status;
    }
}
