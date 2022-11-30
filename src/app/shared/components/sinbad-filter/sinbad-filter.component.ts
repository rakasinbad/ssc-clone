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
import { DefaultCheckbox, SinbadFilterConfig, TFilterResetCheckbox } from './models';
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
    filterStoreOrderTotal: boolean = false;
    filterSupplierDeliveredTotal: boolean = false;
    filterWarehouse: boolean = false;
    filterDate: boolean = false;
    filterPaymentOrderDate: boolean = false;
    filterPaymentDate: boolean = false;
    filterPaymentDueDate: boolean = false;
    filterPaymentType: boolean = false;
    filterPayLaterType: boolean = false;
    filterOrderStatus: boolean = false;
    filterPaymentStatus: boolean = false;
    filterWarehouses: boolean = false;
    filterOrderSource: boolean = false;

    selectedSuppliers: any[] = [];

    sourceStatus: DefaultCheckbox[] = [];
    sourceType: { id: string; label: string }[] = [];
    sourceOrderStatus: any[] = [];
    sourcePaymentStatus: any[] = [];
    sourceSuppliers: any[] = [];
    sourcePaymentType: DefaultCheckbox[] = [];
    sourcePayLaterType: DefaultCheckbox[] = [];
    sourceWarehouses: any[] = [];
    sourceOrderSource: any[] = [];

    maxDate = new Date();
    minDate = null;

    config$: Observable<SinbadFilterConfig>;

    private readonly NUMBER_LIMIT = 9223372036854775808;
    filterStoreOrderTotalLimitNumber: number;
    filterSupplierDeliveredTotalLimitNumber: number;

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

                        if (typeof config.by['storeOrderTotal'] !== 'undefined') {
                            this.filterStoreOrderTotal = true;

                            const limit = config.by['storeOrderTotal'].numberLimitMax || this.NUMBER_LIMIT;
                            this.filterStoreOrderTotalLimitNumber = limit;
                        }

                        if (typeof config.by['supplierDeliveredTotal'] !== 'undefined') {
                            this.filterSupplierDeliveredTotal = true;

                            const limit = config.by['supplierDeliveredTotal'].numberLimitMax || this.NUMBER_LIMIT;
                            this.filterSupplierDeliveredTotalLimitNumber = limit;
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

                            if (typeof config.by['date'].minDate !== 'undefined') {
                                this.minDate = config.by['date'].minDate;
                            }
                        }

                        if (typeof config.by['paymentOrderDate'] !== 'undefined') {
                            this.filterPaymentOrderDate = true;
                        }

                        if (typeof config.by['paymentDueDate'] !== 'undefined') {
                            this.filterPaymentDueDate = true;
                        }

                        if (typeof config.by['paymentDate'] !== 'undefined') {
                            this.filterPaymentDate = true;
                        }

                        if (typeof config.by['paymentType'] !== 'undefined') {
                            this.filterPaymentType = true;
                            if (config.by['paymentType'].sources) {
                                this.sourcePaymentType = [...config.by['paymentType'].sources];
                            }
                        }

                        if (typeof config.by['payLaterType'] !== 'undefined') {
                            this.filterPayLaterType = true;
                            if (config.by['payLaterType'].sources) {
                                this.sourcePayLaterType = [...config.by['payLaterType'].sources];
                            }
                        }

                        if (typeof config.by['orderStatus'] !== 'undefined') {
                            this.filterOrderStatus = true;
                            if (config.by['orderStatus'].sources) {
                                this.sourceOrderStatus = [...config.by['orderStatus'].sources];
                            }
                        }

                        if (typeof config.by['paymentStatus'] !== 'undefined') {
                            this.filterPaymentStatus = true;
                            if (config.by['paymentStatus'].sources) {
                                this.sourcePaymentStatus = [...config.by['paymentStatus'].sources];
                            }
                        }

                        if (typeof config.by['warehouses'] !== 'undefined') {
                            this.filterWarehouses = true;
                            if (config.by['warehouses'].sources) {
                                this.sourceWarehouses = [...config.by['warehouses'].sources];
                            }
                        }

                        if (typeof config.by['orderSource'] !== 'undefined') {
                            this.filterOrderSource = true;
                            if (config.by['orderSource'].sources) {
                                this.sourceOrderSource = [...config.by['orderSource'].sources];
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
        this._resetCheckbox(['sourcePaymentType', 'sourcePayLaterType']);
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
    
    onChangePaymentType(ev: MatCheckboxChange): void {
        const sourceSelected = this.sourcePaymentType.filter((item) => item.checked);

        HelperService.debug('[SinbadFilterComponent] onChangePaymentType', {
            sourcePaymentType: this.sourcePaymentType,
            sourceSelected,
            ev,
        });

        this.form.get('paymentType').setValue(sourceSelected);
    }
    
    onChangePayLaterType(ev: MatCheckboxChange): void {
        const sourceSelected = this.sourcePayLaterType.filter((item) => item.checked);

        HelperService.debug('[SinbadFilterComponent] onChangePayLaterType', {
            sourcePayLaterType: this.sourcePayLaterType,
            sourceSelected,
            ev,
        });

        this.form.get('payLaterType').setValue(sourceSelected);
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

    trackByPaymentType(index: number, item: any): string {
        if (!item) {
            return null;
        }

        return item.id || index;
    }

    trackByPayLaterType(index: number, item: any): string {
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

    private _resetCheckbox(sources: TFilterResetCheckbox[]): void {
        sources.forEach((source: any) => {
            this[source] = this[source].map(({ id, label }) => ({
                id,
                label,
                checked: false,
            }));
        });
    }

    private _resetSegment(): void {
        this.resetSegmentChannel = true;
        this.resetSegmentCluster = true;
        this.resetSegmentGroup = true;
        this.resetSegmentType = true;
    }
}
