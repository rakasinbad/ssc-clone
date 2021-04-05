export interface CatalogueFilterDto {
    brandId?: number;
    subBrandId?: string;
    invoiceGroupId?: number;
    priceGte?: string;
    priceLte?: string;
    status?: 'all' | 'active' | 'inactive';
    type?: 'bonus' | 'regular';
}
