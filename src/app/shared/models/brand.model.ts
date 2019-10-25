import { TNullable, TStatus } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

export interface IBrand extends ITimestamp {
    id: string;
    name: string;
    address: TNullable<string>;
    longitude: TNullable<number>;
    latitude: TNullable<number>;
    phoneNo: TNullable<string>;
    imageUrl: TNullable<string>;
    official: boolean;
    status: TStatus;
    urbanId: string;
}

export class Brand extends Timestamp {
    id: string;
    name: string;
    address: TNullable<string>;
    longitude: TNullable<number>;
    latitude: TNullable<number>;
    phoneNo: TNullable<string>;
    imageUrl: TNullable<string>;
    official: boolean;
    status: TStatus;
    urbanId: string;

    constructor(
        id: string,
        name: string,
        address: TNullable<string>,
        longitude: TNullable<number>,
        latitude: TNullable<number>,
        phoneNo: TNullable<string>,
        imageUrl: TNullable<string>,
        official: boolean,
        status: TStatus,
        urbanId: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.name = name ? name.trim() : name;
        this.address = address ? address.trim() : address;
        this.longitude = longitude;
        this.latitude = latitude;
        this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
        this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
        this.official = official;
        this.status = status;
        this.urbanId = urbanId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class BrandAssocUser extends Timestamp {
    id: string;
    brandId: string;
    status: TStatus;
    brand: Brand;

    constructor(
        id: string,
        brandId: string,
        status: TStatus,
        brand: Brand,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.brandId = brandId;
        this.status = status;
        this.brand = brand
            ? {
                  ...new Brand(
                      brand.id,
                      brand.name,
                      brand.address,
                      brand.longitude,
                      brand.latitude,
                      brand.phoneNo,
                      brand.imageUrl,
                      brand.official,
                      brand.status,
                      brand.urbanId,
                      brand.createdAt,
                      brand.updatedAt,
                      brand.deletedAt
                  )
              }
            : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
