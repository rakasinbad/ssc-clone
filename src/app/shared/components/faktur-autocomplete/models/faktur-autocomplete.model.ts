import { SinbadAutocompleteSource } from '../../sinbad-autocomplete/models';

export interface FakturResponse {
    readonly id: NonNullable<string>;
    code: string;
    minimumOrder: number;
    name: string;
    status: 'active' | 'inactive';
}

export class FakturAutocomplete implements SinbadAutocompleteSource {
    readonly id: NonNullable<string>;
    label: string;
    originalSource: FakturResponse;

    constructor(data: SinbadAutocompleteSource) {
        const { id, label, originalSource } = data;

        this.id = id;
        this.label = label && label.trim();
        this.originalSource = originalSource;
    }
}
