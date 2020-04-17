interface IEntityPayload<T> {
    id: string;
    data: T;
    [key: string]: any;
}

export class EntityPayload<T> implements IEntityPayload<T> {
    id: string;
    data: T;
    [key: string]: any;

    constructor(entity: IEntityPayload<T>) {
        this.id = entity.id;
        this.data = entity.data;
    }
}
