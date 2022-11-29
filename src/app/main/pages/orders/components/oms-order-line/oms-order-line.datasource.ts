import { DataSource } from '@angular/cdk/table';
import { OrderLineType } from 'app/shared/models/order-line-type.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OrderFacadeService } from '../../services';

export class OmsOrderLineDataSource implements DataSource<any> {
    data$: Observable<any[]>;
    totalDataSource$: BehaviorSubject<number> = new BehaviorSubject(0);

    constructor(private orderFacade: OrderFacadeService, private type: OrderLineType) {
        this.data$ = this.orderFacade
            .getOrderBrandByType(this.type)
            .pipe(tap((sources: any[]) => this.totalDataSource$.next(sources.length || 0)));
    }

    connect(): Observable<any[]> {
        return this.data$;
    }

    disconnect(): void {
        this.totalDataSource$.complete();
        this.orderFacade.clear();
    }
}
