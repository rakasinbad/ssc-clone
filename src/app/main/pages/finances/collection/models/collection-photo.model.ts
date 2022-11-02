export interface ICollectionPhoto {
    readonly id: NonNullable<number>;
    image: string;
    skpImage: NonNullable<string>;
}

export class CollectionPhoto {
    readonly id: NonNullable<number>;
    image: string;

    constructor(data: ICollectionPhoto) {
        const { id, image } = data;

        this.id = id;
        this.image = image;
    }
}
