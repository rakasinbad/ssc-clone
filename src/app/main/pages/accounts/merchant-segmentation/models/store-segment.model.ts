export class StoreSegment<T> {
    constructor(public deepestLevel: number, public data: Array<T>) {}
}
