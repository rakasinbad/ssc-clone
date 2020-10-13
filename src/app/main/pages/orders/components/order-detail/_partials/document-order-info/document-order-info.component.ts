import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-document-order-info',
    templateUrl: './document-order-info.component.html',
    styleUrls: ['./document-order-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentOrderInfoComponent {
    @Input()
    data: any;

    @Input()
    loading: boolean;
}
