import { ISearchBarConfiguration } from '../../search-bar/models';

interface CardHeaderBaseConfig {
    // Label yang ingin ditampilkan di view.
    label?: string;
}

interface CardHeaderSearchConfig extends ISearchBarConfiguration {
    // Berisi nilai untuk memunculkan fitur search.
    active?: boolean;
}

interface CardHeaderButtonConfig extends CardHeaderBaseConfig {
    // Berisi string akses permission apakah diperbolehkan atau tidak.
    permissions?: Array<string>;
    // Berisi function yang akan dilakukan ketika tombol diklik.
    onClick?(): void;
}

export interface ICardHeaderConfiguration {
    title?: CardHeaderBaseConfig;
    search?: CardHeaderSearchConfig;
    add?: CardHeaderButtonConfig;
    export?: CardHeaderButtonConfig;
    import?: CardHeaderButtonConfig;
    filter?: CardHeaderButtonConfig;
    groupBy?: CardHeaderButtonConfig;
}
