import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { BehaviorSubject, Subject, of, Observable } from 'rxjs';
import { takeUntil, tap, withLatestFrom, switchMap, take, catchError, } from 'rxjs/operators';
import { IQueryParams } from 'app/shared/models/query.model';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Store as NgRxStore } from '@ngrx/store';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { StoreSegmentationTypesApiService } from 'app/shared/components/dropdowns/store-segmentation/store-segmentation-types/services';
import { SelectionTree, } from 'app/shared/components/selection-tree/selection-tree/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
  selector: 'app-catalogue-mss-settings',
  templateUrl: './catalogue-mss-settings.component.html',
  styleUrls: ['./catalogue-mss-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueMssSettingsComponent implements OnInit, OnChanges, OnDestroy {
  dataSource = [
    [
      {
        name: "RAKA"
      },
      {
        name: "REzzzzaa"
      },
      {
        name: "Nugraha"
      },
      {
        name: "Lore"
      },
      {
        name: "aa"
      },
      {
        name: "dddd"
      }
    ]
  ]

  console = console;

  // Untuk menyimpan Entity yang belum ditransformasi untuk keperluan select advanced.
  availableEntities$: BehaviorSubject<Array<SelectionTree>> = new BehaviorSubject<Array<SelectionTree>>([]);

  // Subject untuk keperluan subscription.
  subs$: Subject<void> = new Subject<void>();

  totalEntities$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  @Input('segmentationType') segmentationType: 'type' | 'group' | 'channel' | 'cluster';


  constructor(
    private helper$: HelperService,
    private store: NgRxStore<fromAuth.FeatureState>,
    private errorMessage$: ErrorMessageService,
    private entityApi$: StoreSegmentationTypesApiService
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
        switchMap<[null, UserSupplier], Observable<IPaginatedResponse<any>>>(([_, userSupplier]) => {
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
                .find<IPaginatedResponse<any>>(newQuery)
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
    const params: IQueryParams = {
        paginate: false,
        limit: 10,
        skip: 0
    };

    this.requestEntity(params);
  }

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
