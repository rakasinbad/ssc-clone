import { Observable } from 'rxjs';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
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

    constructor(
        private store: Store<returnsReducer.FeatureState>
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
    };

    ngOnInit(): void {
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