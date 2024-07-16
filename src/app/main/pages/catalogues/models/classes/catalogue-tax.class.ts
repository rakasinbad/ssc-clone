import { CatalogueTaxResponseProps } from '../interfaces/catalogue-tax-response.interface';
import { CatalogueTaxProps, PricingTypeProps } from '../interfaces/catalogue-tax.interface';

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

export class PricingType implements PricingTypeProps {
    readonly id: NonNullable<string>;
    name: string;
    tooltip?: string

    /** TODO: set interface pricing type */
    constructor(data: any) {
        const { id, name, tooltip } = data;

        this.id = id;
        this.name = (name && name.trim()) || null;
        this.tooltip = tooltip;
    }
}
