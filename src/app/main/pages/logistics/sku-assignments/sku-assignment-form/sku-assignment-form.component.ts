import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { FormActions, UiActions } from 'app/shared/store/actions';

import { fromSkuAssignments } from '../store/reducers';

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

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private SkuAssignmentsStore: NgRxStore<fromSkuAssignments.SkuAssignmentsState>
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

        this.SkuAssignmentsStore.dispatch(UiActions.showFooterAction());

        // Mengatur ulang status form.
        this.SkuAssignmentsStore.dispatch(FormActions.resetFormStatus());
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
