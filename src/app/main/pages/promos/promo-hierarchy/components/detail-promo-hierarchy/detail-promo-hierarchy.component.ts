import {
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, combineLatest } from 'rxjs';
import { PromoHierarchy } from '../../models';
import { FeatureState as PromoHierarchyCoreState } from '../../store/reducers';
import { PromoHierarchySelectors } from '../../store/selectors';
import { takeUntil, tap, withLatestFrom, map } from 'rxjs/operators';
// import { Router } from '@angular/router';
import { FormStatus, IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { PromoHierarchyActions } from '../../store/actions';
import { HelperService } from 'app/shared/helpers';
import { PromoHierarchyPayload } from '../../models/promo-hierarchy.model';
import * as moment from 'moment';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
  selector: 'app-detail-promo-hierarchy',
  templateUrl: './detail-promo-hierarchy.component.html',
  styleUrls: ['./detail-promo-hierarchy.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailPromoHierarchyComponent implements OnInit, AfterViewInit, OnDestroy {
    private subs$: Subject<void> = new Subject<void>();
    navigationSub$: Subject<void> = new Subject<void>();

    isLoading$: Observable<boolean>;

    // tslint:disable-next-line: no-inferrable-types
    section: string = 'general-information';

    formMode: IFormMode = 'view';
    // tslint:disable-next-line
    formValue: | Partial<PromoHierarchy>;

    selectedPromo$: Observable<PromoHierarchy>;

    @ViewChild('detail', { static: true, read: ElementRef }) promoDetailRef: ElementRef<
        HTMLElement
    >;

    constructor(
        // private router: Router,
        private cdRef: ChangeDetectorRef,
        private PromoHierarchyStore: NgRxStore<PromoHierarchyCoreState>
    ) {
        const breadcrumbs: Array<IBreadcrumbs> = [
            {
                title: 'Home',
            },
            {
                title: 'Promo',
            },
            {
                title: 'Promo Hierarchy',
            },
            {
                title: 'Promo Hierarchy Detail',
                active: true,
                keepCase: true,
            },
        ];

        this.PromoHierarchyStore.dispatch(
            UiActions.createBreadcrumb({
                payload: breadcrumbs,
            })
        );

        // this.isLoading$ = combineLatest([
        //     this.PromoHierarchyStore.select(PromoHierarchySelectors.getLoadingState),
        // ]).pipe(
        //     map((loadingStates) => loadingStates.includes(true)),
        //     takeUntil(this.subs$)
        // );

        this.PromoHierarchyStore.dispatch(FormActions.resetFormStatus());
        this.PromoHierarchyStore.dispatch(FormActions.setFormStatusInvalid());
        this.PromoHierarchyStore.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
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

    onFormValueChanged(
        $event:
            | PromoHierarchy
    ): void {
        switch (this.section) {
            case 'promo-information': {
                const {
                    id,
                    externalId,
                    name,
                    platform,
                    maxCollectionPerStore,
                    maxVoucherRedemption,
                    // budget,
                    startDate,
                    endDate,
                    description,
                    shortDescription,
                    // imageSuggestion,
                    // isAllowCombineWithVoucher,
                    // isFirstBuy,
                } = $event as PromoHierarchy;

                this.formValue = {
                    id,
                    externalId,
                    name,
                    platform,
                    maxCollectionPerStore,
                    maxVoucherRedemption,
                    // budget,
                    startDate,
                    endDate,
                    description,
                    shortDescription,
                    // imageSuggestion,
                    // isAllowCombineWithVoucher,
                    // isFirstBuy,
                };

                break;
            }
            case 'layout-information': {
                const {
                    id,
                    layer,
                } = $event as PromoHierarchy;

                this.formValue = {
                    id,
                    layer,
                };

                break;
            }
            
        }
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0:
                this.section = 'promo-information';
                break;
            case 1:
                this.section = 'layer-information';
                break;
           
        }
    }

    scrollTop(element: ElementRef<HTMLElement>): void {
        element.nativeElement.scrollTop = 0;
    }

    ngOnInit(): void {
        // this.selectedPromo$ = this.PromoHierarchyStore.select(PromoHierarchySelectors.getSelectedPromoHierarchy).pipe(
        //     tap((value) =>
        //         HelperService.debug(
        //             '[Promo Hierarchy/DETAILS] GET SELECTED Promo Hierarchy',
        //             value
        //         )
        //     ),
        //     takeUntil(this.subs$)
        // );

    }

    ngAfterViewInit(): void {
        // Memeriksa status refresh untuk keperluan memuat ulang data yang telah di-edit.

    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.navigationSub$.next();
        this.navigationSub$.complete();

        this.PromoHierarchyStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }
}
