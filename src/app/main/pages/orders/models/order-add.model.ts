import { TNullable } from 'app/shared/models/global.model';

export interface IProductList {
    readonly _id: NonNullable<string>;
    UOM: string;
    advancePrice: NonNullable<number>;
    catalogueId: number;
    discountPrice: NonNullable<number>;
    maxQty: number;
    minQty: number;
    minQtyType: string;
    multipleQty: number;
    multipleQtyType: string;
    packageQty: number;
    price: NonNullable<number>;
    productImage: string;
    productName: string;
    skuSupplier: string;
    tax: number;
    taxType: string;
    orderQty: number;
    isUnlimitedStock: boolean;
    stock: number;
    errorQty: string;
}

export class ProductList {
 
    readonly _id: NonNullable<string>;
    UOM: string;
    advancePrice: NonNullable<number>;
    catalogueId: number;
    discountPrice: NonNullable<number>;
    maxQty: number;
    minQty: number;
    minQtyType: string;
    multipleQty: number;
    multipleQtyType: string;
    packageQty: number;
    price: NonNullable<number>;
    productImage: string;
    productName: string;
    skuSupplier: string;
    tax: number;
    taxType: string;
    orderQty: number;
    isUnlimitedStock: boolean;
    stock: number;
    errorQty: string;
    
    constructor(data: IProductList) {
        const {
            _id,
            UOM,
            advancePrice,
            catalogueId,
            discountPrice,
            maxQty,
            minQty,
            minQtyType,
            multipleQty,
            multipleQtyType,
            packageQty,
            price,
            productImage,
            productName,
            skuSupplier,
            tax,
            taxType,
            orderQty,
            isUnlimitedStock,
            stock,
            errorQty
        } = data;

        this._id = _id;
        this.UOM = UOM;
        this.advancePrice = advancePrice;
        this.catalogueId = catalogueId;
        this.discountPrice = discountPrice;
        this.maxQty = maxQty;
        this.minQty = minQty;
        this.minQtyType = minQtyType;
        this.multipleQty = multipleQty;
        this.multipleQtyType = multipleQtyType;
        this.packageQty = packageQty;
        this.price = price;
        this.productImage = productImage;
        this.productName = productName;
        this.skuSupplier = skuSupplier;
        this.tax = tax;
        this.taxType = taxType;
        this.orderQty = orderQty;
        this.isUnlimitedStock = isUnlimitedStock;
        this.stock = stock;
        this.errorQty = errorQty;
    }
}

export interface SuppliersInf {
    id: string;
    code: string;
    name: string;
}

export interface StoresInf {
    id: string;
    storeCode: string;
    name: string;
    address: string;
}

export interface InvoiceGroupsInf {
    id: string;
    code: string;
    name: string;
    externalId: string;
}

export interface CataloguesInf {
    catalogueId: number;
    skuId: string;
    skuSupplier: string;
    productName: string;
    productImage: string;
    UOM: string;
    price: number;
    promo: number;
    tax: number;
    taxType: string;
    qty: number;
    qtyType: string;
    packageQty: number;
}

export interface BonusCataloguesInf {
    catalogueId: number;
    skuId: string;
    skuSupplier: string;
    productName: string;
    productImage: string;
    UOM: string;
    qty: number;
    qtyType: string;
}

export interface OrderBrandsInf {
    orderBrandId: number;
    brandName: string;
    catalogues: CataloguesInf[];
    bonusCatalogues: BonusCataloguesInf[];
    grossPrice: number;
    promo: number;
    taxes: number;
    untaxed: number;
    finalPrice: number;
}

export interface ItemsInf {
    cartParcelId: number;
    orderParcelId: string;
    orderCode: string;
    created_at: string;
    estDeliveredDate: string;
    dueDate: string;
    estDueDate: string;
    invoiceGroup: InvoiceGroupsInf;
    orderBrands: OrderBrandsInf[];
    minTrx?: number;
}

// For Checkout Order

export interface IProductCheckout {
    cartId: string;
    orderId: string;
    supplier: SuppliersInf;
    store: StoresInf;
    items: ItemsInf[];
    status: string;
}

export class ProductCheckout {
    cartId: string;
    orderId: string;
    supplier: SuppliersInf;
    store: StoresInf;
    items: ItemsInf[];

    constructor(data: IProductCheckout) {
        const { cartId, orderId, supplier, store, items } = data;

        this.cartId = cartId;
        this.orderId = orderId;
        this.supplier = supplier;
        this.store = store;
        this.items = items || [];
    }
}

export interface ProductListParams {
    catalogueId: number;
    qty: number;
}

export class CreateManualOrder {
    storeId: number;
    supplierStoreId: number;
    orderDate: string;
    product: ProductListParams[];

    constructor(data: CreateManualOrder) {
        const { storeId, supplierStoreId, orderDate, product } = data;

        this.storeId = storeId;
        this.supplierStoreId = supplierStoreId;
        this.orderDate = orderDate;
        this.product = product;
    }
}
