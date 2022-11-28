import { SubBrandProps } from './interfaces/sub-brand.interface';

export class SubBrand implements SubBrandProps {
    readonly id: NonNullable<string>;
    code: string;
    name: string;

    constructor(data: SubBrandProps) {
        const { id, code, name } = data;

        this.id = id;
        this.code = code && code.trim();
        this.name = name && name.trim();
    }
}
