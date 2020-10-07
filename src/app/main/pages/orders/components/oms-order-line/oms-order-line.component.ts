import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { OrderLineType } from 'app/shared/models/order-line-type.model';
import { environment } from 'environments/environment';
import { OrderFacadeService } from '../../services';
import { OmsOrderLineDataSource } from './oms-order-line.datasource';

@Component({
    selector: 'app-oms-order-line',
    templateUrl: './oms-order-line.component.html',
    styleUrls: ['./oms-order-line.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmsOrderLineComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        'product',
        'order-qty',
        'unit-price',
        'gross-price',
        'discount-price',
        'type',
    ];

    dataSource: OmsOrderLineDataSource;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @Input()
    orderLineType: OrderLineType = 'non_bonus';

    constructor(private orderFacade: OrderFacadeService) {}

    ngOnInit(): void {
        this._getOrderBrandCatalogue(this.orderLineType);
    }

    private _getOrderBrandCatalogue(type: OrderLineType): void {
        this.dataSource = new OmsOrderLineDataSource(this.orderFacade, type);
    }
}
