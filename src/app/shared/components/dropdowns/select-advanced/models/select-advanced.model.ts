interface ISelectAdvanced {
    id: string;
    label: string;
    data: any;
}

export class SelectAdvanced implements ISelectAdvanced {
    id: string;
    label: string;
    data: any;

    constructor(payload: ISelectAdvanced) {
        const { id, label, data } = payload;

        this.id = id;
        this.label = label;
        this.data = data;
    }
}
