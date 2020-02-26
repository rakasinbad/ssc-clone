import {
    Component,
    OnInit,
    OnDestroy,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { IBreadcrumbs } from 'app/shared/models';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material';

import { fromSkuAssignments } from '../store/reducers';
import * as fromWarehouses from 'app/main/pages/logistics/warehouses/store/reducers';
import { Warehouse } from '../../warehouses/models';
import { NoticeService, ErrorMessageService } from 'app/shared/helpers';
import { Observable, Subject } from 'rxjs';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { map, takeUntil } from 'rxjs/operators';
import { WarehouseSelectors } from 'app/shared/store/selectors/sources';
import { WarehouseActions } from 'app/shared/store/actions';

@Component({
    selector: 'app-sku-assignment-form',
    templateUrl: './sku-assignment-form.component.html',
    styleUrls: ['./sku-assignment-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkuAssignmentFormComponent implements OnInit, OnDestroy {
    pageType: string;

    subs$: Subject<string> = new Subject<string>();

    warehouseList$: Observable<Array<Warehouse>>;

    form: FormGroup;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Warehouse'
        },
        {
            title: 'SKU Assignment'
        },
        {
            title: 'Add New SKU Assignment'
        }
    ];

    @ViewChild('warehouse', { static: false }) warehouse: MatSelect;
    warehouseSub: Subject<string> = new Subject<string>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private SkuAssignmentsStore: NgRxStore<fromSkuAssignments.SkuAssignmentsState>,
        private warehousesStore: NgRxStore<fromWarehouses.FeatureState>,
        private _notice: NoticeService,
        private errorMessageSvc: ErrorMessageService
    ) {
        this.SkuAssignmentsStore.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor Konten Produk',
                            active: true
                        },
                        value: {
                            active: false
                        },
                        active: false
                    },
                    action: {
                        goBack: {
                            label: 'Back',
                            active: true,
                            url: '/pages/logistics/sku-assignments'
                        },
                        save: {
                            label: 'Save',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Batal',
                            active: false
                        }
                    }
                }
            })
        );

        this.warehouseList$ = this.warehousesStore.select(WarehouseSelectors.selectAll).pipe(
            map(warehouses => {
                if (warehouses.length === 0) {
                    this.warehousesStore.dispatch(
                        WarehouseActions.fetchWarehousesRequest({
                            payload: {
                                paginate: true
                            }
                        })
                    );
                }

                return warehouses;
            }),
            takeUntil(this.subs$)
        );

        this.SkuAssignmentsStore.dispatch(UiActions.showFooterAction());

        // Mengatur ulang status form.
        this.SkuAssignmentsStore.dispatch(FormActions.resetFormStatus());
    }

    checkFormValidation(form: FormGroup, stores: Array<Warehouse>): void {
        // if (form.invalid || stores.length === 0) {
        //     this.warehousesStore.dispatch(FormActions.setFormStatusInvalid());
        // } else if (form.valid && stores.length > 0) {
        //     this.warehousesStore.dispatch(FormActions.setFormStatusValid());
        // }
    }

    ngOnInit(): void {
        // Set breadcrumbs
        this.SkuAssignmentsStore.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );

        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            this.pageType = 'new';
        } else if (Math.sign(id) === 1) {
            this.pageType = 'edit';
        } else {
            this.router.navigateByUrl('/pages/logistics/sku-assignments');
        }

        // Inisialisasi form.
        this.form = this.fb.group({
            warehouse: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ]
        });
    }

    ngOnDestroy(): void {
        this.SkuAssignmentsStore.dispatch(UiActions.hideFooterAction());
        this.SkuAssignmentsStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.SkuAssignmentsStore.dispatch(UiActions.hideCustomToolbar());
        this.SkuAssignmentsStore.dispatch(FormActions.resetFormStatus());
        this.SkuAssignmentsStore.dispatch(FormActions.resetClickSaveButton());
        this.SkuAssignmentsStore.dispatch(FormActions.resetCancelButtonAction());
    }
}
