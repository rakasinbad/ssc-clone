import { SinbadAutocompleteSource } from '../../sinbad-autocomplete/models';

export interface BrandResponse {
    readonly id: NonNullable<string>;
    code: string;
    name: string;
    official: boolean;
    status: 'active' | 'inactive';
}

export class BrandAutocomplete implements SinbadAutocompleteSource {
    readonly id: NonNullable<string>;
    label: string;
    originalSource: BrandResponse;

    constructor(data: SinbadAutocompleteSource) {
        const { id, label, originalSource } = data;

        this.id = id;
        this.label = label && label.trim();
        this.originalSource = originalSource;
    }
}
