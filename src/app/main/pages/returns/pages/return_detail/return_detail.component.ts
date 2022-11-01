import { Observable, Subject, BehaviorSubject} from 'rxjs';
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
import { ISteps } from '../../models/returndetail.model';
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
    activeIndexStepper: BehaviorSubject<number> = new BehaviorSubject(-1);
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
                let returnLogsV2 = this._onBuildStepConfig(data.steps, data.status, data.returned);

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

        /** handle refresh after edit data */
        this.store.select(ReturnsSelector.getIsRefresh)
            .subscribe((isRefresh) => {
                if (isRefresh) {
                    this.loadData();
                }
            });
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

        this.activeIndexStepper.next(0);
        this.activeIndexStepper.complete();
    }

    private _onBuildStepConfig(steps: ISteps, status: string, returned: boolean): StepConfig[] {
        let logs: StepConfig[] = [];
        const stepConfig = (id: string, value?: { date: string, by: string }): StepConfig => {
            const description = value ? `${moment(value.date).format('DD/MM/YY')} by ${value.by}` : null;

            return new StepConfig({
                id,
                title: getReturnStatusTitle(id),
                description
            })
        };

        logs.push(stepConfig('pending', steps.pending));
        logs.push(stepConfig('approved', steps.approved));
        logs.push(stepConfig('approved_returned', steps.approved_returned));
        logs.push(stepConfig('closed', steps.closed));

        const approvedIdx = logs.findIndex(data => data.id === 'approved');
        let returnedIdx = logs.findIndex(data => data.id === 'approved_returned');
        
        if (steps.rejected) {
            /** cek apakah ada rejected data */
            const rejectedDesc = `${moment(steps.rejected.date).format('DD/MM/YY')} by ${steps.rejected.by}`;

            if (approvedIdx > -1) {
                logs[approvedIdx].description = rejectedDesc;
                logs[approvedIdx].icon = 'x'
            }
            if (returnedIdx > -1) {
                logs[returnedIdx].description = rejectedDesc;
                logs[returnedIdx].icon = 'x'
            }
        } else {
            /** handle selain status rejected */
            if (
                /** jika taken by salesman == true otomatis status akan ke approved_returned, tidak ada approved */
                (status === 'pending' && returned) ||
                /** cek apakah ada property approved dari BE jika tidak ada, tidak perlu ditampilkan, terjadi jika status == approved_returned/closed */
                (!steps.approved && approvedIdx > -1)    
            ) {
                logs.splice(approvedIdx, 1)
            }
    
            /** refresh return index */
            returnedIdx = logs.findIndex(data => data.id === 'approved_returned');
    
            if (!steps.approved_returned && returnedIdx > -1) {
                /** cek apakah ada property returned dari BE jika tidak ada, tidak perlu ditampilkan, terjadi jika status closed */
                logs.splice(returnedIdx, 1)
            }
        }

        /** mencari data stepper yang sedang aktif saat ini */
        let activeIndexStepper = 0;
        logs.map(log => log.description && activeIndexStepper++);
        this.activeIndexStepper.next(activeIndexStepper);

        return logs;
    }
}
