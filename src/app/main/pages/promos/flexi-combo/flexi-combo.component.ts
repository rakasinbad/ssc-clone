import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-flexi-combo',
    templateUrl: './flexi-combo.component.html',
    styleUrls: ['./flexi-combo.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboComponent implements OnInit {
    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Flexi Combo',
        },
        search: {
            active: true,
            // changed: (value: string) => {
            //     switch (this.selectedViewBy) {
            //         case 'sku-assignment-warehouse':
            //             this.SkuAssignmentsStore.dispatch(
            //                 SkuAssignmentsWarehouseActions.setSearchValue({
            //                     payload: value
            //                 })
            //             );
            //             break;
            //         case 'sku-assignment-sku':
            //             this.SkuAssignmentsStore.dispatch(
            //                 SkuAssignmentsSkuActions.setSearchValue({
            //                     payload: value
            //                 })
            //             );
            //             break;

            //         default:
            //             return;
            //     }
            // }
        },
        add: {
            permissions: [],
        },
        // viewBy: {
        //     list: [
        //         { id: 'sku-assignment-warehouse', label: 'Warehouse' },
        //         { id: 'sku-assignment-sku', label: 'SKU' }
        //     ],
        //     onChanged: (value: { id: string; label: string }) => this.clickTabViewBy(value.id)
        // },
        export: {
            permissions: [],
            useAdvanced: true,
            pageType: '',
        },
        import: {
            permissions: [],
            useAdvanced: true,
            pageType: '',
        },
    };

    private unSubs$: Subject<void> = new Subject<void>();

    constructor(private router: Router) {}

    ngOnInit(): void {
        // this.buttonViewByActive$ = this.SkuAssignmentsStore.select(
        //     UiSelectors.getCustomToolbarActive
        // );
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/promos/flexi-combo/new');
    }
}
