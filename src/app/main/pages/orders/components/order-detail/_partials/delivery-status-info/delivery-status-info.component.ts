import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-delivery-status-info',
    templateUrl: './delivery-status-info.component.html',
    styleUrls: ['./delivery-status-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryStatusInfoComponent {
    @Input()
    data: any;

    @Input()
    loading: boolean;
}
