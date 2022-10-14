import { Observable, Subject } from 'rxjs';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ICancelReason } from 'app/main/pages/orders/models';
import { OrderFacadeService } from 'app/main/pages/orders/services';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'app-order-status-info',
    templateUrl: './order-status-info.component.html',
    styleUrls: ['./order-status-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusInfoComponent implements  OnDestroy, OnInit {
    console = console;
    @Input()
    data: any;

    @Input()
    loading: boolean;

    @Output('onChangeOrderStatus')
    orderStatus: EventEmitter<ICancelReason> = new EventEmitter();

    selectedCancelReason: ICancelReason;
    cancelOrderReasons$: Observable<ICancelReason[]> = this.orderFacade.cancelOrderReason$;
    isLoadingCancelOrderReasons$: Observable<boolean> = this.orderFacade.isLoadingCancelOrderReason$;
    isConfirmedCancelOrder$: Observable<boolean> = this.orderFacade.isConfirmedCancelOrder$;
    private subs$ = new Subject<void>();

    constructor(
        private orderFacade: OrderFacadeService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.orderFacade.getCancelOrderReason();
        this.isConfirmedCancelOrder$
            .pipe(
                takeUntil(this.subs$)
            )
            .subscribe(confirmed => {
                if (confirmed) {
                    this.selectedCancelReason = null;
                    this.changeDetectorRef.markForCheck();
                }
            })
        this.changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    check(index, status):boolean {
        switch (status) {
            case 'checkout':
                if (index < 0) {
                    return true;
                }
                return false;
            case 'pending':
                if (index < 1) {
                    return true;
                }
                return false;
            case 'pending_payment':
                if (index < 2) {
                    return true;
                }
                return false;
            case 'confirm':
                if (index < 3) {
                    return true;
                }
                return false;
            case 'pending_partial':
                if (index < 4) {
                    return true;
                }
                return false;
            case 'pending_supplier':
                if (index < 5) {
                    return true;
                }
                return false;
            case 'packing':
                if (index < 6) {
                    return true;
                }
                return false;
            case 'shipping':
                if (index < 7) {
                    return true;
                }
                return false;
            case 'delivered':
                if (index < 8) {
                    return true;
                }
                return false;
            case 'done':
                if (index < 9) {
                    return true;
                }
                return false;
            case 'cancel':
                if (index < 10) {
                    return true;
                }
                return false;
            default:
                return false;
        }
    }
    
    isShowCancelOrder(): boolean {
        /** show button or no, default is false */
        return {
            'pending': true,
            'pending_payment': true,
            'pending_partial': true,
            'confirm': true,
            'packing': true,
            'shipping': true,
            'cancel': true,
            'delivered': false,
            'done': false,
            'default': false,
        }[this.data ? this.data.status : 'default'] || false
    }

    isDisabledCancelReasonOrder(): boolean {
        return this.data.status === 'cancel';
    }
}
