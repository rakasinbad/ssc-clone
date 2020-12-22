import { TSort } from './global.model';

export interface IQueryParams {
    limit?: number;
    skip?: number;
    sort?: TSort;
    sortBy?: string;
    paginate?: boolean;
    search?: IQuerySearchParams[];
    isWaitingForPayment?: boolean;
}

export interface IQuerySearchParams {
    fieldName: string;
    keyword: string | number;
}

export interface IQueryParamsVoucher {
    limit?: number;
    skip?: number;
    sort?: TSort;
    sortBy?: string;
    totalOrderValue?: string;
    used?: string;
    collected?: string;
    paginate?: boolean;
    search?: IQuerySearchParams[];
    isWaitingForPayment?: boolean;
}

export interface IQueryParamsPromoList {
    limit?: number;
    skip?: number;
    sort?: TSort;
    sortBy?: string;
    paginate?: boolean;
    search?: IQuerySearchParams[];
    isWaitingForPayment?: boolean;
    promo_limit?: number;
    promo_skip?: number;
}

export interface IQueryParamsCustomerList {
    store_limit?: number;
    store_skip?: number;
}