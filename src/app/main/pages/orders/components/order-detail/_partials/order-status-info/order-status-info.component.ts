import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

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
}
