import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-order-status-info',
    templateUrl: './order-status-info.component.html',
    styleUrls: ['./order-status-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusInfoComponent {
    @Input()
    data: any;

    @Input()
    loading: boolean;

    @Output('onChangeOrderStatus')
    orderStatus: EventEmitter<string> = new EventEmitter();;

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
}
