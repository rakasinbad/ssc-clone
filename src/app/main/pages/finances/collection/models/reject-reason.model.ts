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