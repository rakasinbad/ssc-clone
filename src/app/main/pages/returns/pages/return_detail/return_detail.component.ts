import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, take } from 'rxjs/operators';
import * as moment from 'moment';
import 'moment-timezone';
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
import { DocumentLogItemViewModel } from '../../component/document_log';
import { StepConfig } from 'app/shared/components/react-components/Stepper/partials';
import { IReturnDetailLog, } from '../../models/returndetail.model';
import { getReturnStatusTitle } from '../../models/returnline.model';

/**
 * @author Mufid Jamaluddin
 */
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
            title: null,
            returnNumber: null,
            storeName: null,
            status: null,
            returned: null,
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
            returnLogs: [],
            returnLogsV2: []
        };
        this.displayedReturnLineColumns = [
            'product-name',
            'qty',
            'unit-price',
            'total-price',
            'return-reason',
            'note',
        ];
    }

    isLoading$: Observable<boolean>;
    returnInfoViewData$: Observable<Partial<ReturnDetailComponentViewModel>>;
    defaultViewData: ReturnDetailComponentViewModel;

    displayedReturnLineColumns: Array<string>;
    activeIndexStepper: number;
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

                let createdAtStr;
                let dataLogs: Array<DocumentLogItemViewModel>|null = null;
                /** TODO-kanzun-43: build step config */
                let returnLogsV2 = []//this._onBuildStepConfig(data.returnParcelLogs).reverse();
                this.activeIndexStepper = 1//this._onBuildStepConfig(data.returnParcelLogs).length;

                try {
                    createdAtStr = data.createdAt ?
                        // @ts-ignore
                        moment(data.createdAt).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss') : '-';
                        // moment(data.createdAt).tz('Asia/Jakarta').format('DD MMMM YYYY, h:mm:ss z') : '-';
                } catch (e) {
                    createdAtStr = data.createdAt ?
                        moment(data.createdAt).format('DD/MM/YYYY HH:mm:ss') : '-';
                        // moment(data.createdAt).format('DD MMMM YYYY, h:mm:ss Z') : '-';
                }

                if (data.returnParcelLogs) {
                    dataLogs = data.returnParcelLogs.map((item) => ({
                        title: item.description,
                        happenedAt: item.createdAt,
                    }));
                }

                return {
                    title: data.returnNumber,
                    returnNumber: data.returnNumber,
                    storeName: data.storeName,
                    status: data.status,
                    returned: data.returned,
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
                            value: data.steps.created.by,
                        },
                        {
                            key: 'Store Address',
                            value: data.storeAddress,
                        },
                    ],
                    dateInfo: [
                        {
                            key: 'Created Date',
                            value: createdAtStr,
                            isDate: true,
                        }
                    ],
                    returnInfo: [
                        {
                            key: 'Returned By Store',
                            value: data.returned ? 'Yes' : 'No',
                        },
                        {
                            key: 'Order Reference',
                            value: data.orderCode,
                            link: `/pages/orders/${data.orderParcelId}/detail`
                        }
                    ],
                    returnLines: data.returnItems || [],
                    totalReturnLine: (data.returnItems || []).length,
                    returnSummaries: [
                        {
                            key: 'Return Quantity',
                            value: data.returnsQty,
                        },
                        {
                            key: 'Return Amount',
                            value: this.formatRp(data.totalAmount) || '-',
                        },
                    ],
                    returnLogs: dataLogs,
                    returnLogsV2
                };
            }),
            takeUntil(this._unSubscribe$),
        );

        this.loadData();
    }

    formatRp(data: any): string {
        const dataNum = Number(data);
        return !isNaN(dataNum) ? dataNum.toLocaleString(
            'id',
            {
                style: 'currency',
                currency: 'IDR',
            }
        ) : null;
    }

    onChangeReturnStatus(status): void {
        const { id } = this.route.snapshot.params;

        this.returnInfoViewData$
        .pipe(
            distinctUntilChanged(),
            takeUntil(this._unSubscribe$),
            take(1)
        )
        .subscribe(({ returnLines }) => {
            if (status !== 'closed') {
                this.store.dispatch(ReturnActions.confirmChangeQuantityReturn({
                    payload: {
                        status: status,
                        id: id,
                        tableData: [...returnLines]
                    }
                }));
            } else {
                this.store.dispatch(ReturnActions.confirmChangeStatusReturn({
                    payload: { 
                        id, 
                        change: {
                            status
                        }, 
                        tableData: [...returnLines], 
                    }
                }));
            }
        })
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

    private _onBuildStepConfig(returnParcelLogs: IReturnDetailLog[]): StepConfig[] {
        /** TODO-kanzun-43: build step config */
        // let returnParcelLogsStatus = {
        //     created: [],
        //     pending: [],
        //     approved: [],
        //     approvedReturned: [],
        //     rejected: [],
        //     closed: []
        // };

        // returnParcelLogs.map(data => {
        //     returnParcelLogsStatus[data.status].push(data);
        // });
        // returnParcelLogsStatus = returnParcelLogs.reduce((acc, data) => 
        //     ({
        //         ...acc,
        //         [data.status]: [...acc[data.status], data]
        //     })
        // , returnParcelLogsStatus);
        
        return returnParcelLogs.reduce((acc, data) => {
            const { id, status, description } = data
            return [
                ...acc, 
                new StepConfig({
                    id,
                    title: getReturnStatusTitle(status),
                    description,
                    icon: status !== 'rejected' ? 'check' : 'x'
                })
            ]
        }, []);
    }
}