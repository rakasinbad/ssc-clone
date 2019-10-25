import { TStatusOrderDemo } from 'app/shared/models';

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
