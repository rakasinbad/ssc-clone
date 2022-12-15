interface ICatalogueUploadImagePayload {
    base64: string;
}

export interface ICatalogueMedia {
    catalogueId?: string;
    currentImages?: Array<string>;
    uploadedImages: Array<ICatalogueUploadImagePayload>;
    deletedImages: Array<string>;
}

export class CatalogueMedia implements ICatalogueMedia {
    catalogueId?: string;
    currentImages?: Array<string>;
    uploadedImages: Array<ICatalogueUploadImagePayload>;
    deletedImages: Array<string>;

    constructor(data: ICatalogueMedia) {
        const {
            catalogueId,
            currentImages = [],
            uploadedImages = [],
            deletedImages = [],
        } = data;

        this.catalogueId = catalogueId;
        this.currentImages = Array.isArray(currentImages) ? currentImages : [];
        this.uploadedImages = Array.isArray(uploadedImages) ? uploadedImages : [];
        this.deletedImages = Array.isArray(deletedImages) ? deletedImages : [];
    }
}

export interface ICatalogueMediaForm {
    photos: Array<string>;
    oldPhotos: Array<{ id: string; value: string; }>;
}

export class CatalogueMediaForm implements ICatalogueMediaForm {
    photos: Array<string>;
    oldPhotos: Array<{ id: string; value: string; }>;
}
