import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output, TemplateRef, ChangeDetectorRef, SimpleChanges, OnChanges, NgZone } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent, MatDialog } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, startWith, distinctUntilChanged, take, catchError, switchMap, map, exhaustMap } from 'rxjs/operators';
import { SkpLinkedList as Entity } from './models';
import { SelectLinkedSkpApiService as EntitiesApiService, SingleSelectLinkedSkpService } from './services';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Selection } from '../select-advanced/models';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { MultipleSelectionComponent } from 'app/shared/components/multiple-selection/multiple-selection.component';
import { MultipleSelectionService } from 'app/shared/components/multiple-selection/services/multiple-selection.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { HashTable2 } from 'app/shared/models/hashtable2.model';

@Component({
  selector: 'app-select-linked-skp',
  templateUrl: './select-linked-skp.component.html',
  styleUrls: ['./select-linked-skp.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})

export class SelectLinkedSkpComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

    // Form
    entityForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan Entity yang belum ditransformasi untuk keperluan select advanced.
    entities: HashTable2<Entity> = new HashTable2<Entity>([], 'id');
    // Subject untuk mendeteksi adanya perubahan Entity yang terpilih.
    selectedEntity$: BehaviorSubject<Entity> = new BehaviorSubject<Entity>(null);
    // Menyimpan state loading-nya Entity.
    isEntityLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // Untuk menyimpan jumlah semua province.
    totalEntities$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    // Untuk keperluan limit entity.
    // tslint:disable-next-line: no-inferrable-types
    limit: number = 15;
    // Untuk menyimpan search.
    // tslint:disable-next-line: no-inferrable-types
    search: string = '';

    // Untuk keperluan form field.
    // tslint:disable-next-line: no-inferrable-types
    removing: boolean = false;

    // Untuk menandai apakah pilihannya required atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    @Input() required: boolean = false;
    // Untuk menandai apakah form ini di-nonaktifkan atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    @Input() disabled: boolean = true;
    // tslint:disable-next-line: no-inferrable-types no-input-rename
    @Input('placeholder') placeholder: string = 'Choose SKP';

    @Input() promoDateEnd: string = null;

    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<Entity>> = new EventEmitter<TNullable<Entity>>();

    // Untuk keperluan AutoComplete-nya warehouse
    @ViewChild('entityAutoComplete', { static: true }) entityAutoComplete: MatAutocomplete;
    @ViewChild('triggerEntity', { static: true, read: MatAutocompleteTrigger }) triggerEntity: MatAutocompleteTrigger;
    @ViewChild('selectStoreType', { static: false }) selectStoreType: TemplateRef<MultipleSelectionComponent>;

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private entityApi$: EntitiesApiService,
        private applyDialogFactory$: ApplyDialogFactoryService<MultipleSelectionComponent>,
        private matDialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        private notice$: NoticeService,
        private multiple$: MultipleSelectionService,
        private ngZone: NgZone,
        private singleSelectLinkedSkpService: SingleSelectLinkedSkpService,
    ) {
        this.selectedEntity$.pipe(
            tap(x => HelperService.debug('SELECTED ENTITY', x)),
            takeUntil(this.subs$)
        ).subscribe(value => this.selected.emit(value));

        this.isEntityLoading$.pipe(
            tap(x => HelperService.debug('IS ENTITY LOADING?', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.totalEntities$.pipe(
            tap(x => HelperService.debug('TOTAL ENTITIES', x)),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private toggleLoading(loading: boolean): void {
        if (this.ngZone) {
            this.ngZone.run(() => {
                this.isEntityLoading$.next(loading);
            });
        }

        this.cdRef.detectChanges();
    }

    private requestEntity(params: IQueryParams): void {
        this.toggleLoading(true);
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
                console.log('this.disable req entity->', this.disabled)
                console.log('newQuery->', newQuery)
                if (this.disabled == false) {
                    // Melakukan request data skp.
                    return this.entityApi$
                    .find<IPaginatedResponse<Entity>>(newQuery, { version: '2' })
                    .pipe(
                        tap(response => HelperService.debug('FIND SKP', { params: newQuery, response })),
                    );
                } else {

                }
               
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                // Menetampan nilai available entities yang akan ditambahkan.
                if (Array.isArray(response)) {
                    this.entities.upsert(response as Array<Entity>);
                    this.totalEntities$.next((response as Array<Entity>).length);
                } else {
                    this.entities.upsert(response.data as Array<Entity>);
                    this.totalEntities$.next(response.total);
                }

                this.cdRef.markForCheck();
            },
            error: (err) => {
                this.toggleLoading(false);
                HelperService.debug('ERROR FIND ENTITY SKP', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                this.toggleLoading(false);
                HelperService.debug('FIND ENTITY COMPLETED');
            }
        });
    }

    private initEntity(): void {
        // Menyiapkan query untuk pencarian store entity.
        const params: IQueryParams = {
            paginate: true,
            limit: this.limit,
            skip: 0
        };

        // Reset form-nya store entity.
        if (!this.disabled) {
            this.entityForm.enable();
        }
        this.entityForm.reset();
        params['promoEndDate'] = this.promoDateEnd;

        // Memulai request data store entity.
        this.requestEntity(params);
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

    onSelectedEntity(event: MatAutocompleteSelectedEvent): void {
        // Mengirim nilai tersebut melalui subject.
        if (!event) {
            return;
        }

        if (!event.option.value) {
            this.selectedEntity$.next(null);
            return;
        }

        const selectedId = (event.option.value as Selection).id;
        const selectedEntity = this.entities.get(selectedId);

        if (!selectedEntity) {
            this.selectedEntity$.next(null);
            return;
        }

        this.selectedEntity$.next(selectedEntity);
    }

    onEntitySearch(value: string): void {
        if (this.ngZone) {
            this.ngZone.run(() => {
                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: this.limit,
                    skip: 0
                };

                this.search = value;
                queryParams['keyword'] = value;
                queryParams['promoEndDate'] = this.promoDateEnd;

                this.entities.clear();
                this.requestEntity(queryParams);
            });
        }
    }

    onEntityReachedBottom(): void {
        const entitiesLength = this.entities.length;

        const params: IQueryParams = {
            paginate: true,
            limit: this.limit,
            skip: entitiesLength
        };

        if (this.search) {
            params['keyword'] = this.search;
        }
        params['promoEndDate'] = this.promoDateEnd;

        // Memulai request data store entity.
        this.requestEntity(params);
    }

    processEntityAutoComplete(): void {
        if (this.triggerEntity && this.entityAutoComplete && this.entityAutoComplete.panel) {
            fromEvent<Event>(this.entityAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    // Debugging.
                    tap(() => HelperService.debug(`fromEvent<Event>(this.entityAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil nilai terakhir store entity yang tersedia, jumlah store entity dan state loading-nya store entity dari subject.
                    withLatestFrom(this.totalEntities$, this.isEntityLoading$,
                        ($event, totalEntities, isLoading) => ({ $event, entities: this.entities.toArray(), totalEntities, isLoading }),
                    ),
                    // Debugging.
                    tap(() => HelperService.debug('SELECT ENTITY IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, entities, totalEntities }) =>
                        !isLoading && (totalEntities > entities.length) && this.helper$.isElementScrolledToBottom(this.entityAutoComplete.panel)
                    ),
                    takeUntil(this.triggerEntity.panelClosingActions.pipe(
                        tap(() => {
                            HelperService.debug('SELECT ENTITY IS CLOSING ...');
                            this.selectedEntity$.next(this.selectedEntity$.value);
                        })
                    ))
                ).subscribe(() => {
                    // Memulai request data.
                    this.onEntityReachedBottom();
                });
        }
    }

    listenEntityAutoComplete(): void {
        this.ngZone.run(() => this.processEntityAutoComplete());
    }

    displayEntity(item: Entity): string {
        if (!item) {
            return;
        }

        return `${item.name}`;
    }

    private initForm(): void {
        this.entityForm.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(500),
            filter(() => this.entityAutoComplete.isOpen),
            tap(value => HelperService.debug('entityForm value changed', value)),
            takeUntil(this.subs$)
        ).subscribe(value => this.onEntitySearch(value));

        if (this.required) {
            this.entityForm.setValidators(RxwebValidators.required());
        }
    }

    ngOnInit(): void {
        this.initForm();
        console.log('isi disabled oninit->', this.disabled)
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['required']) {
            // if (!changes['required'].isFirstChange()) {
            //     this.entityFormView.clearValidators();

            //     if (changes['required'].currentValue === true) {
            //         this.entityFormView.setValidators(RxwebValidators.required());
            //     }
            // }
        }
        console.log('isi disabledchanges->', this.disabled)
        console.log('entity->', this.entityForm)
        if (this.disabled == false) {
            const params: IQueryParams = {
                paginate: true,
                limit: this.limit,
                skip: 0
            };
            params['promoEndDate'] = this.promoDateEnd;

            //reset
            // this.entityForm.clearValidators();
            // this.entityForm.disable();
            this.selectedEntity$.next(null);
            this.entities.clear();

            this.requestEntity(params);
        }
        console.log('changes->', changes)
        // if (this.disabled == 'true') {
        //     if (changes['disabled'].currentValue === true) {
        //         this.entityForm.disable();
        //     } else {
        //         this.entityForm.enable();
        //     }
        // }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.cdRef.detach();
        this.triggerEntity.closePanel();

        this.singleSelectLinkedSkpService.selectSkpLinkedList(null);

        this.totalEntities$.next(null);
        this.totalEntities$.complete();

        this.selectedEntity$.next(null);
        this.selectedEntity$.complete();

        this.isEntityLoading$.next(null);
        this.isEntityLoading$.complete();
    }

    ngAfterViewInit(): void {
        // this.initEntity();
    }

}

