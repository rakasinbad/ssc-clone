import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { BreadcrumbService } from 'app/shared/helpers';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { OrderFacadeService } from '../../services';

@Component({
    templateUrl: './order-detail-view.component.html',
    styleUrls: ['./order-detail-view.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class OrderDetailViewComponent implements OnInit, OnDestroy {
    data: any;
    loading: boolean;

    private _breadcrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Order Management',
        },
        {
            title: 'Detail Order',
            active: true,
        },
    ];

    private _unSubs$: Subject<any> = new Subject();

    constructor(
        private cdRef: ChangeDetectorRef,
        private location: Location,
        private route: ActivatedRoute,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private orderFacade: OrderFacadeService,
        private breadcrumbService: BreadcrumbService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    ngOnInit(): void {
        this.breadcrumbService.createBreadcrumb(this._breadcrumbs);

        combineLatest([this.orderFacade.isLoading$, this.orderFacade.order$])
            .pipe(
                map((data) => ({ loading: data[0], order: data[1] })),
                takeUntil(this._unSubs$)
            )
            .subscribe(({ loading, order }) => {
                this.data = order;
                this.loading = loading;

                this.cdRef.detectChanges();
            });

        const { id } = this.route.snapshot.params;
        this.orderFacade.getById(id);
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
    }

    goBack(): void {
        this.location.back();
    }

    onSubmit(value): void {
        const { id } = this.route.snapshot.params;
        this.orderFacade.changeCataloguesQty(id, value);
    }
        
    onChangeOrderStatus(status):void {
        const { id } = this.route.snapshot.params;
        const orderCode = this.data.orderCode;

        this.orderFacade.changeOrderStatus(id, orderCode, status);
    }
}
