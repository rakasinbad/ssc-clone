export interface ISearchBarConfiguration {
    useBorder?: boolean;
    placeholder?: string;
    threshold?: number;
    changed?(value: string): void;
}
