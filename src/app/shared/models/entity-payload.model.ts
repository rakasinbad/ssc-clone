interface IEntityPayload<T> {
    id: string;
    data: T;
}

export class EntityPayload<T> implements IEntityPayload<T> {
    id: string;
    data: T;

    constructor(entity: IEntityPayload<T>) {
        this.id = entity.id;
        this.data = entity.data;
    }
}
