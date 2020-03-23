import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Catalogue, CatalogueInformation } from '../../models';
import { fromCatalogue } from '../../store/reducers';
import { CatalogueSelectors, BrandSelectors } from '../../store/selectors';
import { takeUntil, tap, withLatestFrom, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormStatus } from 'app/shared/models/global.model';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { CatalogueActions } from '../../store/actions';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'app-catalogue-detail',
    templateUrl: './catalogue-detail.component.html',
    styleUrls: ['./catalogue-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class CatalogueDetailComponent implements OnInit, AfterViewInit, OnDestroy {

    private subs$: Subject<void> = new Subject<void>();
    navigationSub$: Subject<void> = new Subject<void>();

    isLoading$: Observable<boolean>;

    // tslint:disable-next-line: no-inferrable-types
    section: string = 'sku-information';

    formMode: IFormMode = 'view';
    formValue: Partial<CatalogueInformation>;

    selectedCatalogue$: Observable<Catalogue>;

    constructor(
        private cdRef: ChangeDetectorRef,
        // private router: Router,
        private store: NgRxStore<fromCatalogue.FeatureState>
    ) {
        this.isLoading$ = combineLatest([
            this.store.select(BrandSelectors.getIsLoading),
            this.store.select(CatalogueSelectors.getIsLoading),
        ]).pipe(
            map(loadingStates => loadingStates.includes(true)),
            takeUntil(this.subs$)
        );

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
                        save: {
                            label: 'Save',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Cancel',
                            active: true
                        },
                    }
                }
            })
        );

        this.store.dispatch(FormActions.resetFormStatus());
        this.store.dispatch(FormActions.setFormStatusInvalid());
        this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
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

    onFormStatusChanged(value: FormStatus): void {
        if (this.isEditMode()) {
            if (value === 'VALID') {
                this.store.dispatch(FormActions.setFormStatusValid());
            } else {
                this.store.dispatch(FormActions.setFormStatusInvalid());
            }
        }
    }

    onFormValueChanged($event: CatalogueInformation): void {
        switch (this.section) {
            case 'sku-information':
                const {
                    externalId,
                    name,
                    description,
                    information,
                    detail,
                    brandId,
                    firstCatalogueCategoryId,
                    lastCatalogueCategoryId,
                    unitOfMeasureId,
                } = $event;

                this.formValue = {
                    externalId,
                    name,
                    description,
                    information,
                    detail,
                    brandId,
                    firstCatalogueCategoryId,
                    lastCatalogueCategoryId,
                    unitOfMeasureId,
                };

                break;
        }
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0: this.section = 'sku-information'; break;
            case 1: this.section = 'price-settings'; break;
            case 2: this.section = 'media-settings'; break;
            case 3: this.section = 'weight-and-dimension'; break;
            case 4: this.section = 'amount-settings'; break;
        }
    }

    editCatalogue(): void {
        this.formMode = 'edit';

        this.store.dispatch(UiActions.showFooterAction());
        this.store.dispatch(FormActions.setFormStatusInvalid());
        this.store.dispatch(FormActions.resetClickCancelButton());

        this.cdRef.markForCheck();
    }

    ngOnInit(): void {
        this.selectedCatalogue$ = this.store.select(
            CatalogueSelectors.getSelectedCatalogueEntity
        ).pipe(
            tap(catalogue => console.log(catalogue)),
            takeUntil(this.subs$)
        );

        this.navigationSub$.pipe(
            withLatestFrom(this.selectedCatalogue$),
            takeUntil(this.subs$)
        ).subscribe(([_, { id: catalogueId }]) => {
            this.formMode = 'edit';
            this.cdRef.markForCheck();
            // this.router.navigate([`/pages/catalogues/edit/${this.section}/${catalogueId}`]);
        });
    }

    ngAfterViewInit(): void {
        this.store.select(
            CatalogueSelectors.getRefreshStatus
        ).pipe(
            withLatestFrom(this.selectedCatalogue$),
            takeUntil(this.subs$)
        ).subscribe(([needRefresh, catalogue]) => {
            if (needRefresh) {
                this.formMode = 'view';

                this.store.dispatch(UiActions.hideFooterAction());
                this.store.dispatch(FormActions.resetClickCancelButton());
                this.store.dispatch(FormActions.resetClickSaveButton());
                this.store.dispatch(CatalogueActions.setRefreshStatus({ status: false }));

                this.store.dispatch(
                    CatalogueActions.fetchCatalogueRequest({
                        payload: catalogue.id
                    })
                );
            }
        });

        this.store.select(
            FormSelectors.getIsClickCancelButton
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(isClick => {
            if (isClick) {
                this.formMode = 'view';
                
                this.store.dispatch(UiActions.hideFooterAction());
                this.store.dispatch(FormActions.resetClickCancelButton());
                this.store.dispatch(FormActions.resetClickSaveButton());
            }
        });

        this.store.select(
            FormSelectors.getIsClickSaveButton
        ).pipe(
            withLatestFrom(this.selectedCatalogue$),
            takeUntil(this.subs$)
        ).subscribe(([isClick, catalogue]) => {
            if (isClick) {
                this.store.dispatch(UiActions.hideFooterAction());
                this.store.dispatch(CatalogueActions.patchCatalogueRequest({
                    payload: {
                        id: catalogue.id,
                        data: this.formValue,
                        source: 'form',
                        section: 'sku-information'
                    }
                }));
            }
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.navigationSub$.next();
        this.navigationSub$.complete();
    }

}
