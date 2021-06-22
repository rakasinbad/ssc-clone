export interface ISearchBarConfiguration {
    useBorder?: boolean;
    placeholder?: string;
    threshold?: number;
    value?:string;
    changed?(value: string): void;
}
