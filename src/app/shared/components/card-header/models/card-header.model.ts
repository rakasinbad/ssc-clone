import { ISearchBarConfiguration } from '../../search-bar/models';
import { ExportConfiguration } from '../../exports/models';

interface CardHeaderBaseConfig {
    // Label yang ingin ditampilkan di view.
    label?: string;
}

interface CardHeaderSearchConfig extends ISearchBarConfiguration {
    // Berisi nilai untuk memunculkan fitur search.
    active?: boolean;
}

interface CardHeaderButtonConfig extends CardHeaderBaseConfig {
    // Berisi penentuan menggunakan komponen tingkat lanjut atau yang sederhana saja.
    useAdvanced?: boolean;
    // Berisi string akses permission apakah diperbolehkan atau tidak.
    permissions?: Array<string>;
    // Berisi function yang akan dilakukan ketika tombol diklik.
    onClick?(): void;
}

interface CardHeaderAdvancedButtonConfig extends CardHeaderButtonConfig {
    // Berisi nama tipe halaman yang ingin dituju.
    pageType?: ExportConfiguration['page'];
}

export interface ICardHeaderConfiguration {
    title?: CardHeaderBaseConfig;
    search?: CardHeaderSearchConfig;
    add?: CardHeaderButtonConfig;
    export?: CardHeaderAdvancedButtonConfig;
    import?: CardHeaderAdvancedButtonConfig;
    filter?: CardHeaderButtonConfig;
    groupBy?: CardHeaderButtonConfig;
}
