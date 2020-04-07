import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output, TemplateRef, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent, MatDialog } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, startWith, distinctUntilChanged, take, catchError, switchMap, map, exhaustMap } from 'rxjs/operators';
import { StoreSegmentationType as Entity } from './models';
import { StoreSegmentationTypesApiService as EntitiesApiService } from './services';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { SelectionTree, SelectedTree } from '../selection-tree/models';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { MultipleSelectionComponent } from 'app/shared/components/multiple-selection/multiple-selection.component';
import { SelectionList } from 'app/shared/components/multiple-selection/models';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { MultipleSelectionService } from 'app/shared/components/multiple-selection/services/multiple-selection.service';
import { SelectionTreeComponent } from '../selection-tree/selection-tree.component';

@Component({
    selector: 'tree-store-segmentation',
    templateUrl: './store-segmentation.component.html',
    styleUrls: ['./store-segmentation.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class StoreSegmentationTreeComponent implements OnInit, OnChanges, OnDestroy {

    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan Entity yang belum ditransformasi untuk keperluan select advanced.
    availableEntities$: BehaviorSubject<Array<SelectionTree>> = new BehaviorSubject<Array<SelectionTree>>([]);
    // Untuk menyimpan jumlah semua province.
    totalEntities$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    @Input() segmentationType: 'type' | 'group' | 'channel' | 'cluster';

    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<Array<Entity>>> = new EventEmitter<TNullable<Array<Entity>>>();
    // Untuk mengirim data berupa lokasi yang terakhir dipilih.
    @Output() selectionChanged: EventEmitter<SelectedTree> = new EventEmitter<SelectedTree>();

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private entityApi$: EntitiesApiService,
        private cdRef: ChangeDetectorRef,
        private notice$: NoticeService,
    ) {
        this.availableEntities$.pipe(
            tap(x => HelperService.debug('AVAILABLE ENTITIES', x)),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private requestEntity(params: IQueryParams): void {
        of(null).pipe(
            // tap(x => HelperService.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => HelperService.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<Entity>>>(([_, userSupplier]) => {
                // Jika user tidak ada data supplier.
                if (!userSupplier) {
                    throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                }

                // Mengambil ID supplier-nya.
                const { supplierId } = userSupplier;

                // Membentuk query baru.
                const newQuery: IQueryParams = { ... params };
                // Memasukkan ID supplier ke dalam params baru.
                newQuery['supplierId'] = supplierId;
                // Hanya mengambil yang tidak punya child.
                // newQuery['hasChild'] = false;
                // Request berdasarkan segmentasinya
                newQuery['segmentation'] = this.segmentationType;

                // Melakukan request data warehouse.
                return this.entityApi$
                    .find<IPaginatedResponse<Entity>>(newQuery)
                    .pipe(
                        tap(response => HelperService.debug('FIND ENTITY', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                if (Array.isArray(response)) {
                    this.availableEntities$.next((response as Array<SelectionTree>));
                    this.totalEntities$.next((response as Array<SelectionTree>).length);
                } else {
                    this.availableEntities$.next(response.data as unknown as Array<SelectionTree>);
                    this.totalEntities$.next(response.total);
                }

            },
            error: (err) => {
                HelperService.debug('ERROR FIND ENTITY', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                HelperService.debug('FIND ENTITY COMPLETED');
            }
        });
    }

    private initEntity(): void {
        if (this.segmentationType) {
            // Menyiapkan query untuk pencarian store entity.
            const params: IQueryParams = {
                paginate: false,
                limit: 10,
                skip: 0
            };
    
            // Memulai request data store entity.
            this.requestEntity(params);
        }
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessage$.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
        const { ignoreTouched, ignoreDirty } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return (form.errors || form.status === 'INVALID') && form.touched;
        }

        if (ignoreTouched) {
            return (form.errors || form.status === 'INVALID') && form.dirty;
        }

        return (form.errors || form.status === 'INVALID') && (form.dirty || form.touched);
    }

    onEntitySearch(value: string): void {
        const queryParams: IQueryParams = {
            paginate: false,
        };

        queryParams['search'] = [
            {
                fieldName: 'name',
                keyword: value
            }
        ];

        this.requestEntity(queryParams);
    }

    onEntityReachedBottom(entitiesLength: number): void {
        const params: IQueryParams = {
            paginate: false,
            limit: 10,
            skip: entitiesLength
        };

        // Memulai request data store entity.
        this.requestEntity(params);
    }

    onSelected($event: Array<SelectionTree>): void {
        this.selected.emit($event as unknown as Array<Entity>);
    }

    onSelectionChanged($event: SelectedTree): void {
        this.selectionChanged.emit($event);
    }

    // openStoreTypeSelection(): void {
    //     this.dialog = this.applyDialogFactory$.open({
    //         title: 'Select Store Type',
    //         template: this.selectStoreType,
    //     }, {
    //         disableClose: true,
    //         width: '80vw',
    //         minWidth: '80vw',
    //         maxWidth: '80vw',
    //     });

    //     this.dialog.closed$.subscribe({
    //         next: (value: TNullable<string>) => {
    //             HelperService.debug('DIALOG SELECTION CLOSED', value);

    //             let selection;
    //             if (value === 'apply') {
    //                 if (!this.removing) {
    //                     if (Array.isArray(this.tempEntity)) {
    //                         if (this.tempEntity.length > 0) {
    //                             selection = this.tempEntity;
    //                         } else {
    //                             selection = [];
    //                         }
    //                     } else {
    //                         selection = (this.entityFormValue.value as Array<Selection>);
    //                     }
    //                 } else {
    //                     selection = this.tempEntity;
    //                 }
    //             } else {
    //                 selection = (this.entityFormValue.value as Array<Selection>);
    //             }

    //             if (selection.length === 0) {
    //                 this.entityFormView.setValue('');
    //                 this.entityFormValue.setValue([]);
    //             } else {
    //                 const firstselection = selection[0].label;
    //                 const remainLength = selection.length - 1;
    //                 const viewValue = (firstselection + String(remainLength > 0 ? ` (+${remainLength} ${remainLength === 1 ? 'other' : 'others'})` : ''));

    //                 this.entityFormValue.setValue(selection);
    //                 this.entityFormView.setValue(viewValue);
    //             }

    //             this.onSelectedEntity(this.entityFormValue.value);
    //             this.cdRef.detectChanges();
    //         }
    //     });
    // }

    ngOnInit(): void {
        this.initEntity();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['segmentationType'].isFirstChange()) {
            this.initEntity();
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.totalEntities$.next(null);
        this.totalEntities$.complete();

        this.availableEntities$.next(null);
        this.availableEntities$.complete();
    }
}

