import { CatalogueTaxResponseProps } from '../interfaces/catalogue-tax-response.interface';
import { CatalogueTaxProps } from '../interfaces/catalogue-tax.interface';

export class CatalogueTax implements CatalogueTaxProps {
    readonly id: NonNullable<string>;
    amount: number;
    name: string;

    constructor(data: CatalogueTaxResponseProps) {
        const { id, amount, name } = data;

        this.id = id;
        this.amount = amount;
        this.name = (name && name.trim()) || null;
    }
}
