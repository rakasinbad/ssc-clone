import { ExportConfiguration } from '../../exports/models';
import { ISearchBarConfiguration } from '../../search-bar/models';

interface CardHeaderBaseConfig {
    // Label yang ingin ditampilkan di view.
    label?: string;
}

export interface CardHeaderActionConfig {
    // ID untuk aksi.
    id: string;
    // Label untuk aksi.
    label: string;
}

interface CardHeaderBatchActionsConfig {
    // Berisi daftar action yang tersedia.
    actions?: Array<CardHeaderActionConfig>;
    // Berisi penanda apakah salah 1 action sudah terpilih atau tidak.
    show?: boolean;
    // Berisi function yang akan dilakukan ketika memilih action.
    onActionSelected?(action: CardHeaderActionConfig): void;
}

interface CardHeaderViewByConfig {
    // Berisi daftar view by yang tersedia untuk dipilih.
    list?: Array<{ id: string; label: string }>;
    // Berisi function yang akan dilakukan ketika memilih view by.
    onChanged?(viewBy: { id: string; label: string }): void;
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
    class?: string | Array<string>;
    title?: CardHeaderBaseConfig;
    search?: CardHeaderSearchConfig;
    batchAction?: CardHeaderBatchActionsConfig;
    viewBy?: CardHeaderViewByConfig;
    add?: CardHeaderButtonConfig;
    export?: CardHeaderAdvancedButtonConfig;
    import?: CardHeaderAdvancedButtonConfig;
    filter?: CardHeaderButtonConfig;
    groupBy?: CardHeaderButtonConfig;
}
