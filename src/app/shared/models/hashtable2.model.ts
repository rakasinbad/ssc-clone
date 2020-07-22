import { HelperService } from 'app/shared/helpers';

interface IHashTable<T> {
    __internalId__: string;

    upsert(data: T): void;
    remove(id: string | Array<string>): void;
    isAvailable(id: string): boolean;
    toArray(): Array<T>;
    clear(): void;
}

export class HashTable2<T> implements IHashTable<T> {
    // tslint:disable-next-line: variable-name
    constructor(data: Array<T>, public __internalId__: string) {
        if (!__internalId__) {
            throw Error('Internal ID must be set.');
        }

        if (Array.isArray(data)) {
            if (data.length > 0) {
                this[data[__internalId__]] = data.map((d) => d);
            }
        } else {
            throw Error('Data must be an Array.');
        }

        HelperService.debug('HASHTABLE CREATED', {
            __internalId__,
            data,
            current: this,
        });
    }

    get length(): number {
        return Object.keys(this).filter((key) => key !== '__internalId__').length;
    }

    upsert(data: T | Array<T>): void {
        if (!Array.isArray(data)) {
            this[data[this.__internalId__]] = data;
        } else {
            data.forEach((d) => (this[d[this.__internalId__]] = d));
        }

        HelperService.debug('HASHTABLE UPSERT', { current: this, payload: data });
    }

    remove(id: string | Array<string>): void {
        if (Array.isArray(id)) {
            id.forEach((i) => delete this[i]);
        } else {
            delete this[id];
        }
    }

    isAvailable(id: string): boolean {
        return !!this[id];
    }

    toArray(): Array<T> {
        return Object.keys(this)
            .filter((key) => key !== '__internalId__')
            .map<T>((key) => this[key]);
    }

    clear(): void {
        Object.keys(this).forEach((key) => (key !== '__internalId__' ? delete this[key] : null));
        HelperService.debug('HASHTABLE CLEAR', { current: this });
    }
}
