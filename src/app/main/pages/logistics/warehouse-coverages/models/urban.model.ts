export interface IUrban {
    id: string;
    urban: string;
    zipCode: string;
}

export class Urban {
    id: string;
    urban: string;
    zipCode: string;

    constructor(data: IUrban) {
        const {
            id, urban, zipCode
        } = data;

        this.id = id;
        this.urban = urban;
        this.zipCode = zipCode;
    }
}
