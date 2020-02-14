import {
    Component,
    OnInit,
    OnDestroy,
    ViewEncapsulation,
    ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { IBreadcrumbs } from 'app/shared/models';
import { UiActions, FormActions } from 'app/shared/store/actions';

import * as fromWarehouseCoverages from '../store/reducers';

@Component({
    selector: 'app-warehouse-coverage-form',
    templateUrl: './warehouse-coverage-form.component.html',
    styleUrls: ['./warehouse-coverage-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseCoverageFormComponent implements OnInit, OnDestroy {
    pageType: string;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Logistics'
        },
        {
            title: 'Warehouse Coverage'
        },
        {
            title: 'Add Warehouse Coverage'
        }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromWarehouseCoverages.FeatureState>
    ) {
        this.store.dispatch(
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
                            url: '/pages/logistics/warehouse-coverages'
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

        this.store.dispatch(UiActions.showFooterAction());

        // Mengatur ulang status form.
        this.store.dispatch(FormActions.resetFormStatus());
    }

    ngOnInit(): void {
        // Set breadcrumbs
        this.store.dispatch(
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
            this.router.navigateByUrl('/pages/logistics/warehouse-coverages');
        }
    }

    ngOnDestroy(): void {
        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());
        this.store.dispatch(FormActions.resetFormStatus());
        this.store.dispatch(FormActions.resetClickSaveButton());
        this.store.dispatch(FormActions.resetCancelButtonAction());
    }
}
