import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';

import { SupplierStore } from 'app/shared/models/supplier.model';
import { fromMerchant } from '../../store/reducers';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { StoreSelectors } from '../../store/selectors';
import { takeUntil, withLatestFrom, tap } from 'rxjs/operators';
import { StoreActions } from '../../store/actions';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'merchant-detail-page',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class StoreDetailPageComponent implements OnInit, AfterViewInit, OnDestroy {
    
    private subs$: Subject<void> = new Subject<void>();

    // tslint:disable-next-line: no-inferrable-types
    section: string = 'store';

    formMode: IFormMode = 'view';
    isLoading$: Observable<boolean>;
    isEditLocation$: Observable<boolean>;
    selectedSupplierStore$: Observable<SupplierStore>;
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        // private cdRef: ChangeDetectorRef,
        private store: NgRxStore<fromMerchant.FeatureState>,
    ) {}

    private createBreadcrumbs(): void {
        // Menyiapkan breadcrumb-nya.
        const breadcrumbs: Array<IBreadcrumbs> = [
            {
                title: 'Home',
                // translate: 'BREADCRUMBS.HOME',
                active: false
            },
            {
                title: 'Store',
                translate: 'BREADCRUMBS.CATALOGUE',
                active: false,
                // url: '/pages/catalogues'
            },
            {
                title: 'Store Detail',
                active: true,
                // translate: 'BREADCRUMBS.CATALOGUE',
                // url: '/pages/catalogues'
            },
        ];

        // Memunculkan breadcrumb.
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: breadcrumbs
            })
        );
    }

    private initRefreshStatus(): void {
        // Memeriksa status refresh untuk keperluan memuat ulang data yang telah di-edit.
        this.store.select(
            StoreSelectors.getIsRefresh
        ).pipe(
            withLatestFrom(this.selectedSupplierStore$),
            takeUntil(this.subs$)
        ).subscribe(([needRefresh, supplierStore]) => {
            if (needRefresh) {
                // Mengganti mode form menjadi view.
                this.formMode = 'view';
                // Mengganti refresh status menjadi false.
                this.store.dispatch(StoreActions.setRefreshStatus({ refreshStatus: false }));
                // Mengambil data supplier store dari back-end.
                this.store.dispatch(
                    StoreActions.fetchSupplierStoreRequest({
                        payload: supplierStore.id
                    })
                );
            }
        });
    }

    isAddMode(): boolean {
        return this.formMode === 'add';
    }

    isEditMode(): boolean {
        return this.formMode === 'edit';
    }

    isViewMode(): boolean {
        return this.formMode === 'view';
    }

    editSupplierStore(item: SupplierStore): void {
        if (this.section === 'store') {
            this.store.dispatch(StoreActions.deselectSupplierStore());
            this.router.navigate([`/pages/account/stores/${item.id}`]);
        } else if (this.section === 'location') {
            this.store.dispatch(StoreActions.setEditLocation());
        } else if (this.section === 'employee') {
            this.store.dispatch(FormActions.resetClickSaveButton());
        }
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0: this.section = 'store'; break;
            case 1: this.section = 'employee'; break;
            case 2: this.section = 'location'; break;
        }
    }

    ngOnInit(): void {
        // Membuatkan breadcrumbs
        this.createBreadcrumbs();

        // Mendapatkan state loading.
        this.isLoading$ = this.store.select(StoreSelectors.getIsLoading).pipe(
            takeUntil(this.subs$)
        );

        this.isEditLocation$ = this.store.select(StoreSelectors.getIsEditLocation).pipe(
            takeUntil(this.subs$)
        );

        // Mendapatkan supplier store yang terpilih.
        this.selectedSupplierStore$ = this.store.select(StoreSelectors.getSelectedSupplierStore).pipe(
            tap(value => {
                if (!value) {
                    const { id } = this.route.snapshot.params;

                    this.store.dispatch(StoreActions.fetchSupplierStoreRequest({ payload: id }));
                }
            }),
            takeUntil(this.subs$)
        );
    }

    ngAfterViewInit(): void {
        // Menyiapkan listener untuk refresh status.
        this.initRefreshStatus();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }
}
