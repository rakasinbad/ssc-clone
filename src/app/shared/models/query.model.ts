import { TSort } from './global.model';

export interface IQueryParams {
    limit?: number;
    skip?: number;
    sort?: TSort;
    sortBy?: string;
    paginate?: boolean;
    search?: IQuerySearchParams[];
}

export interface IQuerySearchParams {
    fieldName: string;
    keyword: string | number;
}