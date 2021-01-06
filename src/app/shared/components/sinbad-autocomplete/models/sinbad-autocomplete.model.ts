export type SinbadAutocompleteType = 'multi' | 'single';
export interface SinbadAutocompleteSource {
    readonly id: NonNullable<string>;
    label: string;
    originalSource?: any;
}
