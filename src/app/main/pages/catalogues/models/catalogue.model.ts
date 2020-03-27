import { TNullable, IResponsePaginate } from 'app/shared/models/global.model';
import { ITimestamp, Timestamp } from 'app/shared/models/timestamp.model';
import { Brand } from 'app/shared/models/brand.model';


/*
 ______              __                           ______                                        
/      |            /  |                         /      \                                       
$$$$$$/  _______   _$$ |_     ______    ______  /$$$$$$  |______    _______   ______    _______ 
  $$ |  /       \ / $$   |   /      \  /      \ $$ |_ $$//      \  /       | /      \  /       |
  $$ |  $$$$$$$  |$$$$$$/   /$$$$$$  |/$$$$$$  |$$   |   $$$$$$  |/$$$$$$$/ /$$$$$$  |/$$$$$$$/ 
  $$ |  $$ |  $$ |  $$ | __ $$    $$ |$$ |  $$/ $$$$/    /    $$ |$$ |      $$    $$ |$$      \ 
 _$$ |_ $$ |  $$ |  $$ |/  |$$$$$$$$/ $$ |      $$ |    /$$$$$$$ |$$ \_____ $$$$$$$$/  $$$$$$  |
/ $$   |$$ |  $$ |  $$  $$/ $$       |$$ |      $$ |    $$    $$ |$$       |$$       |/     $$/ 
$$$$$$/ $$/   $$/    $$$$/   $$$$$$$/ $$/       $$/      $$$$$$$/  $$$$$$$/  $$$$$$$/ $$$$$$$/  
                                                                                                
                                                                                                
                                                                                                
*/

type TCatalogueStatus = 'active' | 'inactive' | 'banned';
type TQuantityType = 'pcs' | 'master_box' | 'custom';

export interface IViolationType {
    id: number;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: TNullable<Date>;
}

export interface ICatalogueStockResponse {
    stockEnRoute: number;
}

export interface ICatalogueCategory {
    id: string;
    parentId: TNullable<string>;
    category: string;
    iconHome: TNullable<string>;
    iconTree: TNullable<string>;
    sequence: number;
    hasChild: boolean;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export interface ICatalogueKeyword {
    id: string;
    tag: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export interface ICatalogueKeywordCatalogue {
    id: string;
    catalogueKeywordId: string;
    catalogueId: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    catalogueKeyword: ICatalogueKeyword;
}

export interface ICatalogueImage {
    id: string;
    catalogueId: string;
    imageUrl: string;
    status: 'active' | 'inactive' | 'banned';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export interface ICatalogueTax {
    id: string;
    name: string;
    typeAmount: 'percent' | 'fix';
    amount: number;
    calculate: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export interface ICatalogueType {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export interface ICatalogueUnit {
    id: string;
    unit: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export interface ICatalogueVariant {
    id: string;
    variant: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export interface ICatalogue extends ITimestamp {
    id: string;
    name: string;
    externalId: string;
    barcode: string;
    information: string;
    description: string;
    detail: string;
    // color: string;
    catalogueWeight: TNullable<number>;
    catalogueDimension: TNullable<number>;
    packagedWeight: TNullable<number>;
    packagedDimension: TNullable<number>;
    sku: string;
    // skuRef: string;
    retailBuyingPrice: number; // Harga yang dibeli dari supplier.
    suggestedConsumerBuyingPrice: number; // Harga yang disarankan oleh supplier untuk dijual ke konsumen.
    discountedRetailBuyingPrice: TNullable<number>; // Harga potongan yang diberikan oleh supplier untuk dijual ke toko.
    minQty: number;
    minQtyType: TQuantityType;
    packagedQty: number; // Quantity per Master Box (Jumlah item dalam 1 box)
    multipleQty: number; // Additional Quantity (Nilai pertambahan saat ingin membeli dengan menekan tombol "+" di aplikasi mobile)
    multipleQtyType: TQuantityType; // Additional Quantity Type
    displayStock: boolean;
    stock: number;
    unlimitedStock: boolean;
    // hazardLevel: number;
    dangerItem: boolean;
    // forSale: boolean;
    unitOfMeasureId: number;
    status: TCatalogueStatus;
    // purchaseUnitOfMeasure: number;
    // principalId: number;
    catalogueTaxId: number;
    // catalogueVariantId: number;
    brandId: number;
    firstCatalogueCategoryId: number;
    lastCatalogueCategoryId: number;
    violationTypeId: TNullable<number>;
    violationSuggestion: TNullable<string>;
    violationReason: TNullable<string>;
    // catalogueTypeId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    catalogueCategoryId: TNullable<number>;
    catalogueUnitId: TNullable<number>;
    catalogueImages: Array<CatalogueImage>;
    catalogueTax: CatalogueTax;
    firstCatalogueCategory: CatalogueCategory;
    lastCatalogueCategory: CatalogueCategory;
    catalogueKeywordCatalogues: Array<CatalogueKeywordCatalogue>;
    // catalogueType: ICatalogueType;
    catalogueUnit: CatalogueUnit;
    violationType: TNullable<ViolationType>;
    brand: Brand;
    // catalogueVariant: ICatalogueVariant;
    /**
     * LAINNYA (DIBUTUHKAN KETIKA ADA HAL-HAL KHUSUS)
     */
    stockEnRoute?: number;
    catalogueKeywords?: Array<CatalogueKeyword>;
    deletedImages?: Array<number>;
    uploadedImages?: Array<{ base64: string }>;
    source?: 'fetch' | 'list';
    isSelected?: boolean;
}

export interface ICatalogueUnitResponse extends IResponsePaginate {
    data: Array<CatalogueUnit>;
}

export interface ICataloguesResponse extends IResponsePaginate {
    data: Array<Catalogue>;
}

export interface ICatalogueDemo {
    id: number;
    sku: number;
    parentSku: number;
    name: string;
    image: string;
    variant: string;
    price: number;
    stock: number;
    sale: number;
    isArchived: boolean;
    lastUpdate: Date;
    timeLimit: string;
    blockType: string;
    blockReason: string;
    blockSuggest: string;
}

/*
  ______   __                                                  
 /      \ /  |                                                 
/$$$$$$  |$$ |  ______    _______  _______   ______    _______ 
$$ |  $$/ $$ | /      \  /       |/       | /      \  /       |
$$ |      $$ | $$$$$$  |/$$$$$$$//$$$$$$$/ /$$$$$$  |/$$$$$$$/ 
$$ |   __ $$ | /    $$ |$$      \$$      \ $$    $$ |$$      \ 
$$ \__/  |$$ |/$$$$$$$ | $$$$$$  |$$$$$$  |$$$$$$$$/  $$$$$$  |
$$    $$/ $$ |$$    $$ |/     $$//     $$/ $$       |/     $$/ 
 $$$$$$/  $$/  $$$$$$$/ $$$$$$$/ $$$$$$$/   $$$$$$$/ $$$$$$$/  
*/

export class ViolationType implements IViolationType {
    id: number;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: TNullable<Date>;

    constructor(
        id: number,
        type: string,
        createdAt: Date,
        updatedAt: Date,
        deletedAt: TNullable<Date>
    ) {
        this.id = id;
        this.type = type;
        this.createdAt = new Date(createdAt);
        this.updatedAt = new Date(updatedAt);
        this.deletedAt = deletedAt ? new Date(deletedAt) : null;
    }
}

interface ISimpleCatalogueCategory {
    id: string;
    name: string;
    parent: TNullable<string>;
    hasChildren?: boolean;
}

export class SimpleCatalogueCategory implements ISimpleCatalogueCategory {
    id: string;
    name: string;
    parent: TNullable<string>;
    hasChildren?: boolean;

    constructor(data: ISimpleCatalogueCategory) {
        const {
            id,
            name,
            parent,
            hasChildren,
        } = data;

        this.id = id;
        this.name = name;
        this.parent = parent;
        this.hasChildren = hasChildren;
    }
}

export class CatalogueCategory extends Timestamp {
    id: string;
    parentId: TNullable<string>;
    category: string;
    iconHome: TNullable<string>;
    iconTree: TNullable<string>;
    sequence: number;
    hasChild: boolean;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    children?: Array<CatalogueCategory>;

    constructor(
        id: string,
        parentId: TNullable<string>,
        category: string,
        iconHome: TNullable<string>,
        iconTree: TNullable<string>,
        sequence: number,
        hasChild: boolean,
        status: 'active' | 'inactive',
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>,
        children?: Array<CatalogueCategory>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id;
        this.parentId = parentId ? parentId.trim() : parentId;
        this.category = category ? category.trim() : category;
        this.iconHome = iconHome ? iconHome.trim() : iconHome;
        this.iconTree = iconTree ? iconTree.trim() : iconTree;
        this.sequence = sequence;
        this.hasChild = hasChild;
        this.status = !status ? 'inactive' : status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.children = !Array.isArray(children)
            ? []
            : children.length === 0
            ? []
            : [
                  ...children.map(child => ({
                      ...new CatalogueCategory(
                          child.id,
                          child.parentId,
                          child.category,
                          child.iconHome,
                          child.iconTree,
                          child.sequence,
                          child.hasChild,
                          child.status,
                          child.createdAt,
                          child.updatedAt,
                          child.deletedAt,
                          child.children
                      )
                  }))
              ];
    }
}

export class CatalogueKeyword extends Timestamp {
    id: string;
    tag: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(
        id: string,
        tag: string,
        status: 'active' | 'inactive',
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id;
        this.tag = tag ? tag.trim() : tag;
        this.status = !status ? 'inactive' : status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class CatalogueKeywordCatalogue extends Timestamp {
    id: string;
    catalogueKeywordId: string;
    catalogueId: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    catalogueKeyword: CatalogueKeyword;

    constructor(
        id: string,
        catalogueKeywordId: string,
        catalogueId: string,
        status: 'active' | 'inactive',
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>,
        catalogueKeyword: ICatalogueKeyword
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id;
        this.catalogueKeywordId = catalogueKeywordId
            ? catalogueKeywordId.trim()
            : catalogueKeywordId;
        this.catalogueId = catalogueId ? catalogueId.trim() : catalogueId;
        this.status = !status ? 'inactive' : status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.catalogueKeyword = catalogueKeyword
            ? {
                  ...new CatalogueKeyword(
                      catalogueKeyword.id,
                      catalogueKeyword.tag,
                      catalogueKeyword.status,
                      catalogueKeyword.createdAt,
                      catalogueKeyword.updatedAt,
                      catalogueKeyword.deletedAt
                  )
              }
            : null;
    }
}

export class CatalogueImage extends Timestamp {
    id: string;
    catalogueId: string;
    imageUrl: string;
    status: 'active' | 'inactive' | 'banned';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(
        id: string,
        catalogueId: string,
        imageUrl: string,
        status: 'active' | 'inactive' | 'banned',
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id;
        this.catalogueId = catalogueId;
        this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
        this.status = !status ? 'inactive' : status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class CatalogueTax extends Timestamp {
    id: string;
    name: string;
    typeAmount: 'percent' | 'fix';
    amount: number;
    calculate: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(
        id: string,
        name: string,
        typeAmount: 'percent' | 'fix',
        amount: number,
        calculate: string,
        status: 'active' | 'inactive',
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id;
        this.name = name ? name.trim() : name;
        this.typeAmount = !typeAmount ? 'fix' : typeAmount;
        this.amount = amount;
        this.calculate = calculate ? calculate.trim() : calculate;
        this.status = !status ? 'inactive' : status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class CatalogueType extends Timestamp {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(
        id: string,
        type: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id;
        this.type = type ? type.trim() : type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class CatalogueUnit extends Timestamp {
    id: string;
    unit: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(
        id: string,
        unit: string,
        status: 'active' | 'inactive',
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id;
        this.unit = unit ? unit.trim() : unit;
        this.status = !status ? 'inactive' : status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class CatalogueVariant extends Timestamp {
    id: string;
    variant: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(
        id: string,
        variant: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id;
        this.variant = variant ? variant.trim() : variant;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class Catalogue implements ICatalogue {
    id: string;
    name: string;
    externalId: string;
    barcode: string;
    information: string;
    description: string;
    detail: string;
    // color: string;
    catalogueWeight: TNullable<number>;
    catalogueDimension: TNullable<number>;
    packagedWeight: TNullable<number>;
    packagedDimension: TNullable<number>;
    sku: string;
    // skuRef: string;
    retailBuyingPrice: number; // Harga yang dibeli dari supplier.
    suggestedConsumerBuyingPrice: number; // Harga yang disarankan oleh supplier untuk dijual ke konsumen.
    discountedRetailBuyingPrice: TNullable<number>; // Harga potongan untuk konsumen.
    minQty: number;
    minQtyType: TQuantityType;
    packagedQty: number; // Quantity per Master Box (Jumlah item dalam 1 box)
    multipleQty: number; // Additional Quantity (Nilai pertambahan saat ingin membeli dengan menekan tombol "+" di aplikasi mobile)
    multipleQtyType: TQuantityType; // Additional Quantity Type
    displayStock: boolean;
    stock: number;
    unlimitedStock: boolean;
    // hazardLevel: number;
    dangerItem: boolean;
    // forSale: boolean;
    unitOfMeasureId: number;
    status: TCatalogueStatus;
    // purchaseUnitOfMeasure: number;
    // principalId: number;
    catalogueTaxId: number;
    // catalogueVariantId: number;
    brandId: number;
    firstCatalogueCategoryId: number;
    lastCatalogueCategoryId: number;
    violationTypeId: TNullable<number>;
    violationSuggestion: TNullable<string>;
    violationReason: TNullable<string>;
    // catalogueTypeId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    catalogueCategoryId: TNullable<number>;
    catalogueUnitId: TNullable<number>;
    catalogueImages: Array<CatalogueImage>;
    catalogueTax: CatalogueTax;
    firstCatalogueCategory: CatalogueCategory;
    lastCatalogueCategory: CatalogueCategory;
    catalogueKeywordCatalogues: Array<CatalogueKeywordCatalogue>;
    // catalogueType: ICatalogueType;
    catalogueUnit: CatalogueUnit;
    violationType: TNullable<ViolationType>;
    brand: Brand;
    // catalogueVariant: ICatalogueVariant;
    catalogueKeywords: Array<CatalogueKeyword>;
    deletedImages: Array<number>;
    uploadedImages: Array<{ base64: string }>;
    stockEnRoute: number;
    source?: 'fetch' | 'list';
    isSelected?: boolean;

    constructor(data: ICatalogue) {
        const {
            id,
            name,
            externalId,
            barcode,
            information,
            description,
            detail,
            catalogueWeight,
            catalogueDimension,
            packagedWeight,
            packagedDimension,
            sku,
            retailBuyingPrice,
            suggestedConsumerBuyingPrice,
            discountedRetailBuyingPrice,
            minQty,
            minQtyType,
            packagedQty,
            multipleQty,
            multipleQtyType,
            displayStock,
            stock,
            unlimitedStock,
            dangerItem,
            unitOfMeasureId,
            status,
            catalogueTaxId,
            brandId,
            firstCatalogueCategoryId,
            lastCatalogueCategoryId,
            violationTypeId,
            violationSuggestion,
            violationReason,
            createdAt,
            updatedAt,
            deletedAt,
            catalogueCategoryId,
            catalogueUnitId,
            catalogueImages,
            catalogueTax,
            firstCatalogueCategory,
            lastCatalogueCategory,
            catalogueKeywordCatalogues,
            catalogueUnit,
            violationType,
            brand,
            stockEnRoute,
            source = 'fetch',
            isSelected
        } = data;

        this.id = id;
        this.name = name;
        this.externalId = externalId;
        this.barcode = barcode;
        this.information = information;
        this.description = description;
        this.detail = detail;
        this.catalogueWeight = catalogueWeight ? catalogueWeight : null;
        this.catalogueDimension = catalogueDimension ? catalogueDimension : null;
        this.packagedWeight = packagedWeight ? packagedWeight : null;
        this.packagedDimension = packagedDimension ? packagedDimension : null;
        this.sku = sku;
        this.retailBuyingPrice = retailBuyingPrice;
        this.suggestedConsumerBuyingPrice = suggestedConsumerBuyingPrice;
        this.discountedRetailBuyingPrice = discountedRetailBuyingPrice;
        this.minQty = minQty;
        this.minQtyType = minQtyType;
        this.packagedQty = packagedQty;
        this.multipleQty = multipleQty;
        this.multipleQtyType = multipleQtyType;
        this.displayStock = displayStock;
        this.stock = stock;
        this.unlimitedStock = unlimitedStock;
        this.dangerItem = dangerItem;
        this.unitOfMeasureId = unitOfMeasureId;
        this.status = status;
        this.catalogueTaxId = catalogueTaxId;
        this.brandId = brandId;
        this.firstCatalogueCategoryId = firstCatalogueCategoryId;
        this.lastCatalogueCategoryId = lastCatalogueCategoryId;
        this.violationTypeId = violationTypeId ? violationTypeId : null;
        this.violationSuggestion = violationSuggestion ? violationSuggestion : null;
        this.violationReason = violationReason ? violationReason : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt ? deletedAt : null;
        this.catalogueCategoryId = catalogueCategoryId ? catalogueCategoryId : null;
        this.catalogueUnitId = catalogueUnitId ? catalogueUnitId : null;
        this.catalogueUnit = catalogueUnit;
        this.violationType = violationType ? violationType : null;
        this.brand = brand;
        this.stockEnRoute = stockEnRoute;
        this.source = source;
        this.isSelected = isSelected;
        /*
         dP""b8    db    888888    db    88      dP"Yb   dP""b8 88   88 888888     88 8b    d8    db     dP""b8 888888 .dP"Y8 
        dP   `"   dPYb     88     dPYb   88     dP   Yb dP   `" 88   88 88__       88 88b  d88   dPYb   dP   `" 88__   `Ybo." 
        Yb       dP__Yb    88    dP__Yb  88  .o Yb   dP Yb  "88 Y8   8P 88""       88 88YbdP88  dP__Yb  Yb  "88 88""   o.`Y8b 
         YboodP dP""""Yb   88   dP""""Yb 88ood8  YbodP   YboodP `YbodP' 888888     88 88 YY 88 dP""""Yb  YboodP 888888 8bodP' 
        */
        this.catalogueImages = Array.isArray(catalogueImages)
            ? catalogueImages
                  .map(
                      catalogueImage =>
                          new CatalogueImage(
                              catalogueImage.id,
                              catalogueImage.catalogueId,
                              catalogueImage.imageUrl,
                              catalogueImage.status,
                              catalogueImage.createdAt,
                              catalogueImage.updatedAt,
                              catalogueImage.deletedAt
                          )
                  )
                  .sort((catA, catB) => +catA.id - +catB.id)
            : [];
        /*
         dP""b8    db    888888    db    88      dP"Yb   dP""b8 88   88 888888     888888    db    Yb  dP 
        dP   `"   dPYb     88     dPYb   88     dP   Yb dP   `" 88   88 88__         88     dPYb    YbdP  
        Yb       dP__Yb    88    dP__Yb  88  .o Yb   dP Yb  "88 Y8   8P 88""         88    dP__Yb   dPYb  
         YboodP dP""""Yb   88   dP""""Yb 88ood8  YbodP   YboodP `YbodP' 888888       88   dP""""Yb dP  Yb 
        */
        this.catalogueTax = catalogueTax
            ? {
                  ...new CatalogueTax(
                      catalogueTax.id,
                      catalogueTax.name,
                      catalogueTax.typeAmount,
                      catalogueTax.amount,
                      catalogueTax.calculate,
                      catalogueTax.status,
                      catalogueTax.createdAt,
                      catalogueTax.updatedAt,
                      catalogueTax.deletedAt
                  )
              }
            : null;
        /*
         dP""b8    db    888888 888888  dP""b8  dP"Yb  88""Yb Yb  dP      dP 888888 88 88""Yb .dP"Y8 888888 Yb  
        dP   `"   dPYb     88   88__   dP   `" dP   Yb 88__dP  YbdP      dP  88__   88 88__dP `Ybo."   88    Yb 
        Yb       dP__Yb    88   88""   Yb  "88 Yb   dP 88"Yb    8P       Yb  88""   88 88"Yb  o.`Y8b   88    dP 
         YboodP dP""""Yb   88   888888  YboodP  YbodP  88  Yb  dP         Yb 88     88 88  Yb 8bodP'   88   dP  
        */
        this.firstCatalogueCategory = firstCatalogueCategory
            ? new CatalogueCategory(
                  firstCatalogueCategory.id,
                  firstCatalogueCategory.parentId,
                  firstCatalogueCategory.category,
                  firstCatalogueCategory.iconHome,
                  firstCatalogueCategory.iconTree,
                  firstCatalogueCategory.sequence,
                  firstCatalogueCategory.hasChild,
                  firstCatalogueCategory.status,
                  firstCatalogueCategory.createdAt,
                  firstCatalogueCategory.updatedAt,
                  firstCatalogueCategory.deletedAt
              )
            : null;
        /*
         dP""b8    db    888888 888888  dP""b8  dP"Yb  88""Yb Yb  dP      dP 88        db    .dP"Y8 888888 Yb  
        dP   `"   dPYb     88   88__   dP   `" dP   Yb 88__dP  YbdP      dP  88       dPYb   `Ybo."   88    Yb 
        Yb       dP__Yb    88   88""   Yb  "88 Yb   dP 88"Yb    8P       Yb  88  .o  dP__Yb  o.`Y8b   88    dP 
         YboodP dP""""Yb   88   888888  YboodP  YbodP  88  Yb  dP         Yb 88ood8 dP""""Yb 8bodP'   88   dP  
        */
        this.lastCatalogueCategory = lastCatalogueCategory
            ? new CatalogueCategory(
                  lastCatalogueCategory.id,
                  lastCatalogueCategory.parentId,
                  lastCatalogueCategory.category,
                  lastCatalogueCategory.iconHome,
                  lastCatalogueCategory.iconTree,
                  lastCatalogueCategory.sequence,
                  lastCatalogueCategory.hasChild,
                  lastCatalogueCategory.status,
                  lastCatalogueCategory.createdAt,
                  lastCatalogueCategory.updatedAt,
                  lastCatalogueCategory.deletedAt
              )
            : null;
        /*
         dP""b8    db    888888    db    88      dP"Yb   dP""b8 88   88 888888     88  dP 888888 Yb  dP Yb        dP  dP"Yb  88""Yb 8888b.  .dP"Y8 
        dP   `"   dPYb     88     dPYb   88     dP   Yb dP   `" 88   88 88__       88odP  88__    YbdP   Yb  db  dP  dP   Yb 88__dP  8I  Yb `Ybo." 
        Yb       dP__Yb    88    dP__Yb  88  .o Yb   dP Yb  "88 Y8   8P 88""       88"Yb  88""     8P     YbdPYbdP   Yb   dP 88"Yb   8I  dY o.`Y8b 
         YboodP dP""""Yb   88   dP""""Yb 88ood8  YbodP   YboodP `YbodP' 888888     88  Yb 888888  dP       YP  YP     YbodP  88  Yb 8888Y"  8bodP' 
        */
        this.catalogueKeywordCatalogues = Array.isArray(catalogueKeywordCatalogues)
            ? [
                  ...catalogueKeywordCatalogues.map(catalogueKeywordCatalogue => ({
                      ...new CatalogueKeywordCatalogue(
                          catalogueKeywordCatalogue.id,
                          catalogueKeywordCatalogue.catalogueKeywordId,
                          catalogueKeywordCatalogue.catalogueId,
                          catalogueKeywordCatalogue.status,
                          catalogueKeywordCatalogue.createdAt,
                          catalogueKeywordCatalogue.updatedAt,
                          catalogueKeywordCatalogue.deletedAt,
                          catalogueKeywordCatalogue.catalogueKeyword
                              ? {
                                    ...new CatalogueKeyword(
                                        catalogueKeywordCatalogue.catalogueKeyword.id,
                                        catalogueKeywordCatalogue.catalogueKeyword.tag,
                                        catalogueKeywordCatalogue.catalogueKeyword.status,
                                        catalogueKeywordCatalogue.catalogueKeyword.createdAt,
                                        catalogueKeywordCatalogue.catalogueKeyword.updatedAt,
                                        catalogueKeywordCatalogue.catalogueKeyword.deletedAt
                                    )
                                }
                              : null
                      )
                  }))
              ]
            : [];
        /*
         dP""b8    db    888888    db    88      dP"Yb   dP""b8 88   88 888888     888888 Yb  dP 88""Yb 888888 
        dP   `"   dPYb     88     dPYb   88     dP   Yb dP   `" 88   88 88__         88    YbdP  88__dP 88__   
        Yb       dP__Yb    88    dP__Yb  88  .o Yb   dP Yb  "88 Y8   8P 88""         88     8P   88"""  88""   
         YboodP dP""""Yb   88   dP""""Yb 88ood8  YbodP   YboodP `YbodP' 888888       88    dP    88     888888 
        */
        // this.catalogueType = catalogueType ? {
        //     ...new CatalogueType(
        //         catalogueType.id,
        //         catalogueType.type,
        //         catalogueType.createdAt,
        //         catalogueType.updatedAt,
        //         catalogueType.deletedAt
        //     )
        // } : null;
        /*
         dP""b8    db    888888    db    88      dP"Yb   dP""b8 88   88 888888     88   88 88b 88 88 888888 
        dP   `"   dPYb     88     dPYb   88     dP   Yb dP   `" 88   88 88__       88   88 88Yb88 88   88   
        Yb       dP__Yb    88    dP__Yb  88  .o Yb   dP Yb  "88 Y8   8P 88""       Y8   8P 88 Y88 88   88   
         YboodP dP""""Yb   88   dP""""Yb 88ood8  YbodP   YboodP `YbodP' 888888     `YbodP' 88  Y8 88   88   
        */
        this.catalogueUnit = catalogueUnit
            ? new CatalogueUnit(
                  catalogueUnit.id,
                  catalogueUnit.unit,
                  catalogueUnit.status,
                  catalogueUnit.createdAt,
                  catalogueUnit.updatedAt,
                  catalogueUnit.deletedAt
              )
            : null;
        /*
         dP""b8    db    888888    db    88      dP"Yb   dP""b8 88   88 888888     Yb    dP    db    88""Yb 88    db    88b 88 888888 
        dP   `"   dPYb     88     dPYb   88     dP   Yb dP   `" 88   88 88__        Yb  dP    dPYb   88__dP 88   dPYb   88Yb88   88   
        Yb       dP__Yb    88    dP__Yb  88  .o Yb   dP Yb  "88 Y8   8P 88""         YbdP    dP__Yb  88"Yb  88  dP__Yb  88 Y88   88   
         YboodP dP""""Yb   88   dP""""Yb 88ood8  YbodP   YboodP `YbodP' 888888        YP    dP""""Yb 88  Yb 88 dP""""Yb 88  Y8   88   
        */
        // this.catalogueVariant = catalogueVariant ? {
        //     ...new CatalogueVariant(
        //         catalogueVariant.id,
        //         catalogueVariant.variant,
        //         catalogueVariant.createdAt,
        //         catalogueVariant.updatedAt,
        //         catalogueVariant.deletedAt
        //     )
        // } : null;
    }

    static patch(catalogue: Partial<Catalogue>): Partial<Catalogue> {
        return catalogue;
    }

    static hasDiscountPrice(catalogue: Catalogue): boolean {
        return (
            !!catalogue.discountedRetailBuyingPrice || catalogue.discountedRetailBuyingPrice === 0
        );
    }

    static getCataloguePrice(catalogue: Catalogue): number {
        return Catalogue.hasDiscountPrice(catalogue)
            ? catalogue.discountedRetailBuyingPrice
            : catalogue.retailBuyingPrice;
    }
}
