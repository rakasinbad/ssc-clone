import { SinbadAutocompleteSource } from '../../sinbad-autocomplete/models';

export interface SegmentTypeResponse {
    readonly id: NonNullable<string>;
    description: string;
    externalId: string;
    name: string;
    status: 'active' | 'inactive';
}

export class SegmentTypeAutocomplete implements SinbadAutocompleteSource {
    readonly id: NonNullable<string>;
    label: string;
    originalSource: SegmentTypeResponse;

    constructor(data: SinbadAutocompleteSource) {
        const { id, label, originalSource } = data;

        this.id = id;
        this.label = label && label.trim();
        this.originalSource = originalSource;
    }
}
