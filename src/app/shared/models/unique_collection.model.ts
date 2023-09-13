interface ModelWithId {
    id: number | string;
}

/**
 * Unique Collection
 *
 * @author Mufid Jamaluddin
 */
export class UniqueCollection<T extends ModelWithId> {
    private _keys: Set<number | string>;
    private _values: Array<T>;
    private _beforeTotal: number;

    constructor(values?: ReadonlyArray<T> | null) {
        this.clearAllAndAddItems(values || []);
    }

    [Symbol.iterator](): Readonly<IterableIterator<T>> {
        return this._values.values();
    }

    add(value: T): this {
        if (this._keys.has(value.id)) {
            const idx = this._values.findIndex((item) => item.id === value.id);
            if (idx !== -1) {
                this._values[idx] = value;
            }

            return this;
        }

        this._keys.add(value.id);
        this._values.push(value);

        return this;
    }

    addHaveValueBefore(value: T, valueBefore: ReadonlyArray<T>): this {
        for (let data of valueBefore) {
            this._values.push(data)
        };

        if (this._keys.has(value.id)) {
            const idx = this._values.findIndex((item) => item.id === value.id);
            if (idx !== -1) {
                this._values[idx] = value;
            }

            return this;
        }

        this._keys.add(value.id);
        this._values.push(value);

        return this;
    }

    has(value: T): boolean {
        return this._keys.has(value.id);
    }

    size(): number {
        return this._values.length;
    }

    get length(): number {
        return this._values.length;
    }

    oldSize(): number {
        return this._beforeTotal;
    }

    clearAll(): void {
        this._keys.clear();
        this._values = [];
    }

    clearAllAndAddItems(values: ReadonlyArray<T>) {
        this._beforeTotal = Array.isArray(values) ? values.length : 0;

        const uniqueValues = Array.from(values || [])
            .sort((item1, item2) => (item1.id < item2.id ? -1 : 1))
            .filter((item) => item && item.id)
            .filter((val, idx, arr) => !idx || val.id !== arr[idx - 1].id);

        const uniqueKeys = new Set(uniqueValues.map((item) => item.id));

        this._keys = uniqueKeys;
        this._values = uniqueValues;
    }

    toArray(): ReadonlyArray<T> {
        return this._values;
    }

    filter(valueUnselected: any) {
        const uniqueValues = this._values.filter(
            (selected) =>
                String(selected['id'] + selected['group']) !==
                String(valueUnselected.id + valueUnselected.group)
        );
        const uniqueKeys = new Set(uniqueValues.map((item) => item.id));

        this._keys = uniqueKeys;
        this._values = uniqueValues;
    }
}
