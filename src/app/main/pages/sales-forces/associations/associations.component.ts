import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnDestroy,
    AfterViewInit,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    SecurityContext
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { PageEvent, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// NgRx's Libraries
import { Store as NgRxStore } from '@ngrx/store';
// RxJS' Libraries
import { Observable, Subject, merge } from 'rxjs';
import { takeUntil, catchError, distinctUntilChanged, debounceTime, filter } from 'rxjs/operators';
// Environment variables.
import { environment } from 'environments/environment';
// Entity model.
import { Association } from './models/associations.model';
// State management's stuffs.
// import { CoreFeatureState } from './store/reducers';
import { AssociationActions } from './store/actions';
import { AssociationSelector } from './store/selectors';
import { Router } from '@angular/router';
import { IQueryParams } from 'app/shared/models';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-associations',
    templateUrl: './associations.component.html',
    styleUrls: ['./associations.component.scss']
})
export class AssociationsComponent implements OnInit, OnDestroy, AfterViewInit {
    // Untuk menangani search bar.
    search: FormControl;
    // Untuk menampung data association.
    associations: Array<Association>;
    // Untuk menampung status dari state assocation.
    isLoading$: Observable<boolean>;
    // Untuk mendapatkan total association.
    totalAssociations$: Observable<number>;
    // Untuk unsubscribe semua Observable.
    subs$: Subject<void> = new Subject<void>();
    // Menyimpan jumlah data yang ditampilkan dalam 1 halaman.
    defaultPageSize: number = environment.pageSize;
    // Menyimpan nama-nama kolom tabel yang ingin dimunculkan.
    displayedColumns: Array<string> = [
        // 'checkbox',
        'portfolioCode',
        'portfolioName',
        'storeQty',
        'salesTarget',
        'salesRep',
        'actions'
    ];

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    // Menyimpan data baris tabel yang tercentang oleh checkbox.
    selection: SelectionModel<Association> = new SelectionModel<Association>(true, []);

    constructor(
        private _cd: ChangeDetectorRef,
        // private associationStore: NgRxStore<CoreFeatureState>,
        private router: Router,
        private readonly sanitizer: DomSanitizer
    ) {
        // // Mendapatkan state loading.
        // this.isLoading$ = this.associationStore
        //     .select(AssociationSelector.getLoadingState)
        //     .pipe(takeUntil(this.subs$));
        // // Mendapatkan total portfolio dari state.
        // this.totalAssociations$ = this.associationStore
        //     .select(AssociationSelector.getTotalAssociations)
        //     .pipe(takeUntil(this.subs$));
        // // Mendapatkan data portfolio dari state.
        // this.associationStore
        //     .select(AssociationSelector.getAllAssociations)
        //     .pipe(takeUntil(this.subs$))
        //     .subscribe(associations => {
        //         // Mengambil data dari state.
        //         this.associations = associations;
        //         // Meng-update UI sesuai data yang didapat.
        //         this._cd.markForCheck();
        //     });
    }

    /**
     * PRIVATE FUNCTIONS
     */
    // private onRefreshTable(): void {
    //     // Melakukan dispatch untuk mengambil data store berdasarkan ID portfolio.
    //     if (this.paginator) {
    //         // Menyiapkan query parameter yang akan dikirim ke server.
    //         const data: IQueryParams = {
    //             limit: this.paginator.pageSize || this.defaultPageSize,
    //             skip: this.paginator.pageSize * this.paginator.pageIndex || 0
    //         };

    //         // Menyalakan pagination.
    //         data['paginate'] = true;

    //         if (this.sort.direction) {
    //             // Menentukan sort direction tabel.
    //             data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';

    //             // Jika sort yg aktif adalah code, maka sortBy yang dikirim adalah store_code.
    //             if (this.sort.active === 'code') {
    //                 data['sortBy'] = 'store_code';
    //             }
    //         } else {
    //             // Sortir default jika tidak ada sort yang aktif.
    //             data['sort'] = 'desc';
    //             data['sortBy'] = 'id';
    //         }

    //         // Mengambil nilai dari search bar dan melakukan 'sanitasi' untuk menghindari injection.
    //         const searchValue = this.sanitizer.sanitize(SecurityContext.HTML, this.search.value);
    //         // Jika hasil sanitasi lolos, maka akan melanjutkan pencarian.
    //         if (searchValue) {
    //             data['search'] = [
    //                 {
    //                     fieldName: 'code',
    //                     keyword: searchValue
    //                 },
    //                 {
    //                     fieldName: 'name',
    //                     keyword: searchValue
    //                 }
    //             ];
    //         }

    //         // Melakukan request store ke server via dispatch state.
    //         // this.associationStore.dispatch(
    //         //     AssociationActions.fetchPortfoliosRequest({ payload: data })
    //         // );
    //     }
    // }

    /**
     * PUBLIC FUNCTIONS
     */
    // exportAssociation(): void {
    //     // this.associationStore.dispatch(AssociationActions.exportAssociationsRequest());
    // }

    // editAssociation(id: string): void {}

    // viewAssociation(id: string): void {
    //     this.router.navigate([`/pages/sales-force/association/${id}/detail`]);
    // }

    // onChangePage($event: PageEvent): void {}

    // isAllSelected(): boolean {
    //     const numSelected = this.selection.selected.length;
    //     const numRows = this.associations.length;
    //     return numSelected === numRows;
    // }

    // masterToggle(): void {
    //     this.isAllSelected()
    //         ? this.selection.clear()
    //         : this.associations.forEach(row => this.selection.select(row));
    // }

    /**
     * ANGULAR'S LIFECYCLE HOOKS
     */

    ngOnInit(): void {
        this.search = new FormControl('');

        this.search.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000),
                filter(value => {
                    const sanitized = !!this.sanitizer.sanitize(SecurityContext.HTML, value);

                    if (sanitized) {
                        return true;
                    } else {
                        if (value.length === 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }),
                takeUntil(this.subs$)
            )
            .subscribe(() => {
                // this.onRefreshTable();
            });

        // this.onRefreshTable();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    ngAfterViewInit(): void {
        // Melakukan merge Observable pada perubahan sortir dan halaman tabel.
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this.subs$))
            .subscribe(() => {
                // this.onRefreshTable();
            });
    }
}
