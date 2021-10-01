import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import { IReturnDetail } from '../../models';
import { returnsReducer } from '../../store/reducers';
import { ReturnsSelector } from '../../store/selectors';
import { ReturnActions } from '../../store/actions';
import { ReturnDetailComponentViewModel } from './return_detail.component.viewmodel';

@Component({
    selector: 'app-return-detail',
    templateUrl: './return_detail.component.html',
    styleUrls: ['./return_detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ReturnDetailComponent implements OnInit, OnDestroy {

    constructor(
        private store: Store<returnsReducer.FeatureState>,
        private route: ActivatedRoute,
    ) {
        this._unSubscribe$ = new Subject<any>();

        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Return Management',
                    },
                    {
                        title: 'Return Detail',
                    }
                ]
            })
        );

        this.defaultViewData = {
            returnNumber: null,
            storeName: null,
            storeInfo: [
                {
                    key: 'Return Code',
                    value: null,
                },
                {
                    key: 'Store Name',
                    value: null,
                },
                {
                    key: 'Created By',
                    value: null,
                },
                {
                    key: 'Store Address',
                    value: null,
                },
            ],
            dateInfo: [
                {
                    key: 'Created Date',
                    value: null,
                }
            ],
            returnInfo: [
                {
                    key: 'Returned By Store',
                    value: null,
                }
            ],
            returnLines: [],
            totalReturnLine: 0,
            returnSummaries: [
                {
                    key: 'Return Quantity',
                    value: null,
                },
                {
                    key: 'Return Amount',
                    value: null,
                },
            ],
        };

        this.displayedReturnLineColumns = [
            'product-name',
            'qty',
            'unit-price',
            'return-reason',
            'note',
        ];
    }

    isLoading$: Observable<boolean>;
    returnInfoViewData$: Observable<Partial<ReturnDetailComponentViewModel>>;
    defaultViewData: ReturnDetailComponentViewModel;

    displayedReturnLineColumns: Array<string>;
    private readonly _unSubscribe$: Subject<any>;

    loadData(): void {
        const { id: returnParcelId } = this.route.snapshot.params;

        this.store.dispatch(ReturnActions.fetchReturnDetailRequest({
            payload: returnParcelId,
        }));

        this.isLoading$ = this.store.select(ReturnsSelector.getIsLoading);
    }

    ngOnInit(): void {
        this.returnInfoViewData$ = this.store.select(ReturnsSelector.getActiveReturnDetail).pipe(
            map((data: IReturnDetail|null) => {
                if (!data) {
                    return this.defaultViewData;
                }

                console.log(data);

                return {
                    returnNumber: data.returnNumber,
                    storeName: data.storeName,
                    storeInfo: [
                        {
                            key: 'Return Code',
                            value: data.returnNumber,
                        },
                        {
                            key: 'Store Name',
                            value: data.storeName,
                        },
                        {
                            key: 'Created By',
                            value: data.userName,
                        },
                        {
                            key: 'Store Address',
                            value: data.storeAddress,
                        },
                    ],
                    dateInfo: [
                        {
                            key: 'Created Date',
                            value: data.createdAt ?
                                moment(data.createdAt).format('DD MMMM YYYY h:mm:ss Z') : '-',
                            isDate: true,
                        }
                    ],
                    returnInfo: [
                        {
                            key: 'Returned By Store',
                            value: data.returned ? 'Yes' : 'No',
                        }
                    ],
                    returnLines: data.returns || [],
                    totalReturnLine: (data.returns || []).length,
                    returnSummaries: [
                        {
                            key: 'Return Quantity',
                            value: data.returnsQty,
                        },
                        {
                            key: 'Return Amount',
                            value: data.amount ? data.amount.toLocaleString() : '-',
                        },
                    ],
                };
            }),
            takeUntil(this._unSubscribe$),
        );

        this.loadData();
    }

    ngOnDestroy(): void {
        if (this.store) {
            this.store.dispatch(UiActions.resetBreadcrumb());

            delete this.store;
        }

        if (this._unSubscribe$) {
            this._unSubscribe$.next();
            this._unSubscribe$.complete();
        }
    }
}
