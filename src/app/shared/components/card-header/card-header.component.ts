import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ICardHeaderConfiguration } from './models/card-header.model';
import { NgxPermissionsService } from 'ngx-permissions';
import { TNullable, ButtonDesignType } from 'app/shared/models';
import { IButtonImportConfig } from '../import-advanced/models';
import { Store as NgRxStore } from '@ngrx/store';
import { fromExport } from '../exports/store/reducers';
import { ExportActions } from '../exports/store/actions';
import { MatChip } from '@angular/material';

@Component({
    selector: 'sinbad-card-header',
    templateUrl: './card-header.component.html',
    styleUrls: ['./card-header.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardHeaderComponent implements OnInit {

    importBtnConfig: IButtonImportConfig;

    selectedViewByClasses = {
        'red-fg': true,
        'red-border': true,
    };

    notSelectedViewByClasses = {
        'black-fg': true,
        'grey-300-border': true,
    };

    // Class-class untuk mengatur ukuran tombol.
    buttonClasses = {
        'w-92': true,
        'h-32': true,
    };

    // Untuk meletakkan konfigurasi card header.
    @Input() config: ICardHeaderConfiguration = {
        add: {},
        export: {},
        filter: {},
        groupBy: {},
        import: {},
        search: {},
        title: {}
    };

    // Input untuk konfigurasi judul header.
    // tslint:disable-next-line:no-input-rename
    @Input('cardTitle') cardTitle = 'Card Title';


    /**
     * Konfigurasi komponen search.
     */

    // Untuk menentukan apakah fitur search dimunculkan atau tidak.
    // tslint:disable-next-line:no-input-rename
    @Input('isSearchActive') isSearchActive = false;
    // tslint:disable-next-line:no-input-rename
    @Input('searchThreshold') searchThreshold = 500;
    // Untuk menentukan apakah search menggunakan border atau tidak.
    // tslint:disable-next-line:no-input-rename
    @Input('searchUseBorder') searchUseBorder = true;
    // Untuk menentukan placeholder pada "search".
    // tslint:disable-next-line:no-input-rename
    @Input('searchPlaceholder') searchPlaceholder = 'Search';
    // Untuk menentukan placeholder pada "search".
    // tslint:disable-next-line:no-output-rename
    @Output('onSearchChanged') searchChanged: EventEmitter<string> = new EventEmitter<string>();


    /**
     * Konfigurasi tombol "Add".
     */

    // Untuk menentukan judul untuk tombol "Add".
    // tslint:disable-next-line:no-input-rename
    @Input('addTitle') addTitle = 'Add';
    // Untuk menentukan permission untuk dapat mengakses tombol "Add".
    // tslint:disable-next-line:no-input-rename
    @Input('addPermissions') addPermissions: TNullable<Array<string>> = null;
    // Untuk mendengarkan "event" ketika menekan tombol "Add".
    // tslint:disable-next-line:no-output-rename
    @Output('onClickAdd') clickAdd: EventEmitter<void> = new EventEmitter<void>();


    /**
     * Konfigurasi tombol "Export".
     */

    // Untuk menentukan judul untuk tombol "Export".
    // tslint:disable-next-line:no-input-rename
    @Input('exportTitle') exportTitle = 'Export';
    // Untuk menentukan permission untuk dapat mengakses tombol "Export".
    // tslint:disable-next-line:no-input-rename
    @Input('exportPermissions') exportPermissions: TNullable<Array<string>> = null;
    // Untuk mendengarkan "event" ketika menekan tombol "Export".
    // tslint:disable-next-line:no-output-rename
    @Output('onClickExport') clickExport: EventEmitter<void> = new EventEmitter<void>();


    /**
     * Konfigurasi tombol "Import".
     */

    // Untuk menentukan judul untuk tombol "Import".
    // tslint:disable-next-line:no-input-rename
    @Input('importTitle') importTitle = 'Import';
    // Untuk menentukan permission untuk dapat mengakses tombol "Import".
    // tslint:disable-next-line:no-input-rename
    @Input('importPermissions') importPermissions: TNullable<Array<string>> = null;
    // Untuk mendengarkan "event" ketika menekan tombol "Import".
    // tslint:disable-next-line:no-output-rename
    @Output('onClickImport') clickImport: EventEmitter<void> = new EventEmitter<void>();


    /**
     * Konfigurasi tombol "Filter List".
     */

    // Untuk menentukan judul untuk tombol "Filter List".
    // tslint:disable-next-line:no-input-rename
    @Input('filterListTitle') filterListTitle = 'Filter List';
    // Untuk menentukan permission untuk dapat mengakses tombol "Filter List".
    // tslint:disable-next-line:no-input-rename
    @Input('filterListPermissions') filterListPermissions: TNullable<Array<string>> = null;
    // Untuk mendengarkan "event" ketika menekan tombol "Filter List".
    // tslint:disable-next-line:no-output-rename
    @Output('onClickFilterList') clickFilterList: EventEmitter<void> = new EventEmitter<void>();


    /**
     * Konfigurasi tombol "Group By".
     */

    // Untuk menentukan judul untuk tombol "Group By".
    // tslint:disable-next-line:no-input-rename
    @Input('groupByTitle') groupByTitle = 'Group By';
    // Untuk menentukan permission untuk dapat mengakses tombol "Group By".
    // tslint:disable-next-line:no-input-rename
    @Input('groupByPermissions') groupByPermissions: TNullable<Array<string>> = null;
    // Untuk mendengarkan "event" ketika menekan tombol "Group By".
    // tslint:disable-next-line:no-output-rename
    @Output('onClickGroupBy') clickGroupBy: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Konfigurasi "View by".
     */
    // Menyimpan ID view by yang terpilih.
    selectedViewById = '';
    // tslint:disable-next-line:no-input-rename
    @Input('viewByList') viewByList: Array<{ id: string; label: string; }> = [];
    // tslint:disable-next-line:no-output-rename
    @Output('onViewByChanged') viewByChanged: EventEmitter<{ id: string; label: string; }> = new EventEmitter<{ id: string; label: string; }>();


    /**
     * Constructor.
     */
    constructor(
        private cd$: ChangeDetectorRef,
        private ngxPermissionsService: NgxPermissionsService,
        private exportStore: NgRxStore<fromExport.State>,
    ) {}

    /**
     * ngOnInit.
     */
    ngOnInit(): void {
        // Memeriksa konfigurasi.
        if (this.config) {
            // Memeriksa konfigurasi "title".
            if (this.config.title) {
                // Memeriksa konfigurasi label untuk judul card.
                if (this.config.title.label) {
                    this.cardTitle = this.config.title.label;
                }
            }

            // Memeriksa konfigurasi "Search".
            if (this.config.search) {
                // Memeriksa konfigurasi placeholder-nya search.
                if (this.config.search.placeholder) {
                    this.searchPlaceholder = this.config.search.placeholder;
                }

                // Memeriksa konfigurasi aktifnya fitur search.
                if (this.config.search.active) {
                    this.isSearchActive = this.config.search.active;
                }

                // Memeriksa konfigurasi jeda (delay) sebelum event "changed" terkirim.
                if (this.config.search.threshold) {
                    this.searchThreshold = this.config.search.threshold;
                }

                // Memeriksa konfigurasi penggunaan border pada "Search".
                if (this.config.search.useBorder) {
                    this.searchUseBorder = this.config.search.useBorder;
                }
            }

            // Memeriksa konfigurasi "View by".
            if (this.config.viewBy) {
                // Memeriksa konfigurasi daftar pilihan view by.
                if (this.config.viewBy.list) {
                    this.viewByList = this.config.viewBy.list;

                    if (this.config.viewBy.list.length > 0) {
                        this.onViewByChanged(this.config.viewBy.list[0]);
                    }
                }
            }

            // Memeriksa konfigurasi tombol "Add".
            if (this.config.add) {
                // Memeriksa konfigurasi label untuk judul tombol "Add".
                if (this.config.add.label) {
                    this.addTitle = this.config.add.label;
                }
    
                // Memeriksa konfigurasi label untuk permission tombol "Add".
                if (this.config.add.permissions) {
                    this.addPermissions = this.config.add.permissions;
                }
            }

            // Memeriksa konfigurasi tombol "Export".
            if (this.config.export) {
                // Memeriksa konfigurasi label untuk judul tombol "Export".
                if (this.config.export.label) {
                    this.exportTitle = this.config.export.label;
                }
    
                // Memeriksa konfigurasi label untuk permission tombol "Export".
                if (this.config.export.permissions) {
                    this.exportPermissions = this.config.export.permissions;
                }
            }

            // Memeriksa konfigurasi tombol "Import".
            if (this.config.import) {
                // Memeriksa konfigurasi label untuk judul tombol "Import".
                if (this.config.import.label) {
                    this.importTitle = this.config.import.label;
                }
    
                // Memeriksa konfigurasi label untuk permission tombol "Import".
                if (this.config.import.permissions) {
                    this.importPermissions = this.config.import.permissions;
                }

                if (this.config.import.useAdvanced) {
                    this.importBtnConfig = {
                        id: 'import-oms',
                        cssClass: ['w-92', 'h-32'],
                        dialogConf: {
                            title: 'Import',
                            cssToolbar: 'fuse-white-bg'
                        },
                        title: 'Import',
                        type: ButtonDesignType.MAT_STROKED_BUTTON
                    };
                }
            }

            // Memeriksa konfigurasi tombol "Filter List".
            if (this.config.filter) {
                // Memeriksa konfigurasi label untuk judul tombol "Filter List".
                if (this.config.filter.label) {
                    this.filterListTitle = this.config.filter.label;
                }
    
                // Memeriksa konfigurasi label untuk permission tombol "Filter List".
                if (this.config.filter.permissions) {
                    this.filterListPermissions = this.config.filter.permissions;
                }
            }

            // Memeriksa konfigurasi tombol "Group By".
            if (this.config.groupBy) {
                // Memeriksa konfigurasi label untuk judul tombol "Group By".
                if (this.config.groupBy.label) {
                    this.groupByTitle = this.config.groupBy.label;
                }
    
                // Memeriksa konfigurasi label untuk permission tombol "Group By".
                if (this.config.groupBy.permissions) {
                    this.groupByPermissions = this.config.groupBy.permissions;
                }
            }
        }
    }

    /**
     * Fungsi untuk meneruskan "event" ketika menekan tombol "Add".
     */
    onAddClicked(): void {
        if (this.config.add.onClick) {
            this.config.add.onClick();
        } else {
            this.clickAdd.emit();
        }
    }

    /**
     * Fungsi untuk meneruskan "event" ketika menekan pilih "View by" berubah.
     */
    onViewByChanged(viewBy: { id: string; label: string }): void {
        this.selectedViewById = viewBy.id;

        if (this.config.viewBy.onChanged) {
            this.config.viewBy.onChanged(viewBy);
        } else {
            this.viewByChanged.emit(viewBy);
        }
    }

    /**
     * Fungsi untuk meneruskan "event" ketika kolom "Search" berubah.
     */
    onSearchChanged(value: string): void {
        if (this.config.search.changed) {
            this.config.search.changed(value);
        } else {
            this.searchChanged.emit(value);
        }
    }

    /**
     * Fungsi untuk meneruskan "event" ketika menekan tombol "Export".
     */
    onExportClicked(): void {
        // Pemeriksaan konfigurasi export menggunakan advanced.
        if (!this.config.export.useAdvanced) {
            if (this.config.export.onClick) {
                this.config.export.onClick();
            } else {
                this.clickExport.emit();
            }
        } else {
            this.exportStore.dispatch(ExportActions.prepareExportCheck({
                payload: {
                    page: this.config.export.pageType,
                }
            }));
        }
    }

    /**
     * Fungsi untuk meneruskan "event" ketika menekan tombol "Import".
     */
    onImportClicked(): void {
        if (this.config.import.onClick) {
            this.config.import.onClick();
        } else {
            this.clickImport.emit();
        }
    }

    /**
     * Fungsi untuk meneruskan "event" ketika menekan tombol "Filter List".
     */
    onFilterListClicked(): void {
        if (this.config.filter.onClick) {
            this.config.filter.onClick();
        } else {
            this.clickFilterList.emit();
        }
    }

    /**
     * Fungsi untuk meneruskan "event" ketika menekan tombol "Group By".
     */
    onGroupByClicked(): void {
        if (this.config.groupBy.onClick) {
            this.config.groupBy.onClick();
        } else {
            this.clickGroupBy.emit();
        }
    }

}
