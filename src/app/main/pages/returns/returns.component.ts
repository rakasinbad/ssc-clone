import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { UiActions } from 'app/shared/store/actions';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services';
import { returnsReducer } from './store/reducers';
import { ReturnsSelector } from './store/selectors';

@Component({
    selector: 'app-returns',
    templateUrl: './returns.component.html',
    styleUrls: ['./returns.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ReturnsComponent implements OnInit {

    dataSource$: Observable<any>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    private _unSubscribe$: Subject<any> = new Subject<any>();

    constructor(
        private store: Store<returnsReducer.FeatureState>,

        private fuseSidebarService: FuseSidebarService,
        private sinbadFilterService: SinbadFilterService,
        private formBuilder: FormBuilder,
    )
    {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Return Management',
                    },
                ]
            })
        );
    }

    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Return Management',
        },
        search: {
            active: true,
            changed: (value: string) => {

            },
        },
        filter: {
            permissions: [],
            onClick: () => {
                this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen();
            }
        },
    };

    ngOnInit(): void {
        const form = this.formBuilder.group({
            startDate: null,
            endDate: null,
            minAmount: null,
            maxAmount: null,
            orderStatus: null,
            paymentStatus: null,
            warehouses: null,
            orderSource: null
        });

        const filterConfig = {
            by: {
                date: {
                    title: 'Return Date',
                    sources: null,
                },
            },
            showFilter: true,
        };

        this.sinbadFilterService.setConfig({ ...filterConfig, form: form });

        this.sinbadFilterService
            .getClickAction$()
            .pipe(
                filter((action) => action === 'reset' || action === 'submit'),
                takeUntil(this._unSubscribe$)
            )
            .subscribe((action) => {
                if (action === 'reset') {
                    form.reset();
                } else {

                }

                // re refresh table
            });

        this.dataSource$ = this.store.select(ReturnsSelector.getAllReturn);
        this.totalDataSource$ = this.store.select(ReturnsSelector.getTotalReturn);
        this.isLoading$ = this.store.select(ReturnsSelector.getIsLoading);
    }

    onTrackBy(index: number, item: any): string {
        return !item ? null : item.id;
    }

    onTabSelected(index: number): void {

    }
}