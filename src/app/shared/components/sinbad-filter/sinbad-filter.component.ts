import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { Warehouse } from '../dropdowns/single-warehouse/models';
import { SingleWarehouseDropdownService } from '../dropdowns/single-warehouse/services';
import { SinbadAutocompleteSource } from '../sinbad-autocomplete/models';
import { DefaultCheckbox, SinbadFilterConfig } from './models';
import { SinbadFilterService } from './services';

@Component({
    selector: 'app-sinbad-filter',
    templateUrl: './sinbad-filter.component.html',
    styleUrls: ['./sinbad-filter.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SinbadFilterComponent implements OnInit {
    form: FormGroup;
    resetBrand: boolean = false;
    resetSubBrand: boolean = false;
    resetFaktur: boolean = false;
    resetSegmentChannel: boolean = false;
    resetSegmentCluster: boolean = false;
    resetSegmentGroup: boolean = false;
    resetSegmentType: boolean = false;
    showPanel = true;

    filterSegmentChannel: boolean = false;
    filterSegmentCluster: boolean = false;
    filterSegmentGroup: boolean = false;
    filterSegmentType: boolean = false;
    filterBrand: boolean = false;
    filterSubBrand: boolean = false;
    filterFaktur: boolean = false;
    filterbasePrice: boolean = false;
    filterWarehouse: boolean = false;
    filterDate: boolean = false;
    filterOrderStatus: boolean = false;

    selectedSuppliers: any[] = [];

    sourceStatus: DefaultCheckbox[] = [];
    sourceType: { id: string; label: string }[] = [];
    sourceOrderStatus: any[] = [];
    sourcePaymentStatus: any[] = [];
    sourceSuppliers: any[] = [];

    maxDate = new Date();

    config$: Observable<SinbadFilterConfig>;

    constructor(
        private readonly fuseSidebarService: FuseSidebarService,
        private readonly sinbadFilterService: SinbadFilterService,
        private readonly singleWarehouseService: SingleWarehouseDropdownService
    ) {}

    ngOnInit(): void {
        this.config$ = this.sinbadFilterService.getConfig$().pipe(
            tap((config) => {
                if (config.form) {
                    this.form = config.form;

                    if (config.by && Object.keys(config.by).length > 0) {
                        if (typeof config.by['status'] !== 'undefined') {
                            if (config.by['status'].sources) {
                                this.sourceStatus = [...config.by['status'].sources];
                            }
                        }

                        if (typeof config.by['type'] !== 'undefined') {
                            if (config.by['type'].sources) {
                                this.sourceType = config.by['type'].sources;
                            }
                        }

                        if (typeof config.by['brand'] !== 'undefined') {
                            this.filterBrand = true;
                        }

                        if (typeof config.by['subBrand'] !== 'undefined') {
                            this.filterSubBrand = true;
                        }

                        if (typeof config.by['faktur'] !== 'undefined') {
                            this.filterFaktur = true;
                        }

                        if (typeof config.by['basePrice'] !== 'undefined') {
                            this.filterbasePrice = true;
                        }

                        if (typeof config.by['segmentChannel'] !== 'undefined') {
                            this.filterSegmentChannel = true;
                        }

                        if (typeof config.by['segmentCluster'] !== 'undefined') {
                            this.filterSegmentCluster = true;
                        }

                        if (typeof config.by['segmentGroup'] !== 'undefined') {
                            this.filterSegmentGroup = true;
                        }

                        if (typeof config.by['segmentType'] !== 'undefined') {
                            this.filterSegmentType = true;
                        }

                        if (typeof config.by['warehouse'] !== 'undefined') {
                            this.filterWarehouse = true;
                        }

                        if (typeof config.by['date'] !== 'undefined') {
                            this.filterDate = true;
                        }

                        if (typeof config.by['orderStatus'] !== 'undefined') {
                            this.filterOrderStatus = true;
                            if (config.by['orderStatus'].sources) {
                                this.sourceOrderStatus = [...config.by['orderStatus'].sources];
                            }
                        }

                        if (typeof config.by['paymentStatus'] !== 'undefined') {
                            this.filterOrderStatus = true;
                            if (config.by['paymentStatus'].sources) {
                                this.sourcePaymentStatus = [...config.by['paymentStatus'].sources];
                            }
                        }

                        HelperService.debug('[SinbadFilterComponent] ngOnInit getConfig$()', {
                            config,
                        });

                        // if (config.by['suppliers']) {
                        //     this.sourceSuppliers = config.by['suppliers'];
                        // }
                    }
                }
            }),
            shareReplay()
        );
    }

    close(): void {
        this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen();
    }

    onClickReset(): void {
        this.resetBrand = true;
        this.resetSubBrand = true;
        this.resetFaktur = true;
        this._resetSegment();
        this._resetStatus();
        this.singleWarehouseService.selectWarehouse(null);
        this.sinbadFilterService.setClickAction('reset');
    }

    onClickSubmit(): void {
        this.sinbadFilterService.setClickAction('submit');
        this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen();
    }

    onChangeStatus(ev: MatCheckboxChange): void {
        const sourceSelected = this.sourceStatus.filter((item) => item.checked);

        HelperService.debug('[SinbadFilterComponent] onChangeStatus', {
            sourceStatus: this.sourceStatus,
            sourceSelected,
            ev,
        });

        this.form.get('status').setValue(sourceSelected);
    }

    onSelectedBrand(value: SinbadAutocompleteSource | SinbadAutocompleteSource[]): void {
        this.form.get('brand').setValue(value);
    }

    onSelectedFaktur(value: SinbadAutocompleteSource | SinbadAutocompleteSource[]): void {
        this.form.get('faktur').setValue(value);
    }

    onSelectedSegmentChannel(value: SinbadAutocompleteSource | SinbadAutocompleteSource[]): void {
        this.form.get('segmentChannel').setValue(value);
    }

    onSelectedSegmentCluster(value: SinbadAutocompleteSource | SinbadAutocompleteSource[]): void {
        this.form.get('segmentCluster').setValue(value);
    }

    onSelectedSegmentGroup(value: SinbadAutocompleteSource | SinbadAutocompleteSource[]): void {
        this.form.get('segmentGroup').setValue(value);
    }

    onSelectedSegmentType(value: SinbadAutocompleteSource | SinbadAutocompleteSource[]): void {
        this.form.get('segmentType').setValue(value);
    }

    onSelectedWarehouse(value: Warehouse): void {
        this.form.get('warehouse').setValue(value ? new Warehouse(value) : value);
    }

    trackByStatus(index: number, item: any): string {
        if (!item) {
            return null;
        }

        return item.id || index;
    }

    trackByType(index: number, item: any): string {
        if (!item) {
            return null;
        }

        return item.id || index;
    }

    private _resetStatus(): void {
        this.sourceStatus = this.sourceStatus.map(({ id, label }) => ({
            id,
            label,
            checked: false,
        }));
    }

    private _resetSegment(): void {
        this.resetSegmentChannel = true;
        this.resetSegmentCluster = true;
        this.resetSegmentGroup = true;
        this.resetSegmentType = true;
    }
}
