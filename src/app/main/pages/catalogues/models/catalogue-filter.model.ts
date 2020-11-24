export interface CatalogueFilterDto {
    brandId?: number;
    invoiceGroupId?: number;
    priceGte?: string;
    priceLte?: string;
    status?: 'all' | 'active' | 'inactive';
    type?: 'bonus' | 'regular';
}
