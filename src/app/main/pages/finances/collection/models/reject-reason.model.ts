export interface IRejectReason {
    readonly id: NonNullable<number>;
    reasonName: string;
}

export class RejectReason {
    readonly id: NonNullable<number>;
    reasonName: string;

    constructor(data: IRejectReason) {
        const { id, reasonName } = data;

        this.id = id;
        this.reasonName = reasonName;
    }
}

export class PaymColApprove {
    approvalStatus: string;
    collectionRef: string;
}

export class PaymColReject {
    approvalStatus: string;
    collectionRef: string;
    rejectReasonId: number;
}

export class PaymApproval {
    approvalStatus: string;
    billingRef: string;
    rejectedReasonId?: string;
}

export interface IColPaymentApproval {
    readonly id: number;
    billingCode: string;
    billingRef: string;
    updatedAt: string;
    approvalStatus: string;
    reasonName: string;
}

export class ColPaymentApproval {
    readonly id: number;
    billingCode: string;
    billingRef: string;
    updatedAt: string;
    approvalStatus: string;
    reasonName: string;

    constructor(data: IColPaymentApproval) {
        const { id, billingCode, billingRef, updatedAt, approvalStatus, reasonName } = data;

        this.id = id;
        this.billingCode = billingCode;
        this.billingRef = billingRef;
        this.updatedAt = updatedAt;
        this.approvalStatus = approvalStatus;
        this.reasonName = reasonName;
    }
}

export class ColPaymentReject extends ColPaymentApproval {}
