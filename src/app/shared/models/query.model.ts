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

export interface IQueryParamsMedeaGo {
    /** PAGINATION */
    page?: number;
    size?: number;
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
}

export interface IQueryParamsCustomerList {
    limit?: number;
    skip?: number;
    sort?: TSort;
    sortBy?: string;
    paginate?: boolean;
    search?: IQuerySearchParams[];
    isWaitingForPayment?: boolean;
}

export interface IQueryParamsVoucherStore {
    limit?: number;
    skip?: number;
    paginate?: boolean;
    keyword?: string;
    search?: IQuerySearchParams[];
}
 
export interface IArgs {
    key: string;
    value: string | number;
}