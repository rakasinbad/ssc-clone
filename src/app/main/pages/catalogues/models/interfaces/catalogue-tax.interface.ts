export interface CatalogueTaxProps {
    readonly id: NonNullable<string>;
    amount: number;
    name: string;
}

export interface PricingTypeProps {
    readonly id: NonNullable<string>;
    name: string;
    tooltip?: string;
}
