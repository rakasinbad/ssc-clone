import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource, PageEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { IPaymentStatusDemo } from './models/payment-status.model';
import { PaymentStatusFormComponent } from './payment-status-form/payment-status-form.component';
import { statusPayment } from './status';
import { fromPaymentStatus } from './store/reducers';
import { PaymentStatusSelectors } from './store/selectors';
import { ProofOfPaymentFormComponent } from './proof-of-payment-form/proof-of-payment-form.component';

@Component({
    selector: 'app-payment-status',
    templateUrl: './payment-status.component.html',
    styleUrls: ['./payment-status.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentStatusComponent implements OnInit, AfterViewInit, OnDestroy {
    dataSource: MatTableDataSource<IPaymentStatusDemo>; // Need for demo
    displayedColumns = [
        'order-reference',
        'store',
        'account-receivable',
        'status',
        'source',
        'payment-type',
        'payment-method',
        'order-date',
        'due-date',
        'paid-on',
        'aging-day',
        'd',
        'proof-of-payment-status',
        'actions'
    ];
    hasSelected: boolean;
    statusPayment: any;
    today = new Date();

    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private matDialog: MatDialog,
        private store: Store<fromPaymentStatus.FeatureState>,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$generate: GeneratorService,
        public translate: TranslateService
    ) {
        this.dataSource = new MatTableDataSource(); // Need for demo
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Finance',
                        translate: 'BREADCRUMBS.FINANCE'
                    },
                    {
                        title: 'Payment Status',
                        translate: 'BREADCRUMBS.PAYMENT_STATUS',
                        active: true
                    }
                ]
            })
        );
        this.statusPayment = statusPayment;

        // Set default first status active
        this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));

        this._fuseNavigationService.register('customNavigation', this.statusPayment);
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.hasSelected = false;

        // Need for demo
        this.store
            .select(PaymentStatusSelectors.getAllPaymentStatus)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(source => (this.dataSource = new MatTableDataSource(source)));
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        // Need for demo
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                this.initTable();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onDelete(item): void {
        if (!item) {
            return;
        }
    }

    onProofPayment(): void {
        this.matDialog.open(ProofOfPaymentFormComponent, {
            data: {
                title: 'Proof of Payment'
            },
            disableClose: true
        });
    }

    onUpdate(): void {
        this.matDialog.open(PaymentStatusFormComponent, {
            data: {
                title: 'Review'
            },
            disableClose: true
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initTable(): void {}
}
