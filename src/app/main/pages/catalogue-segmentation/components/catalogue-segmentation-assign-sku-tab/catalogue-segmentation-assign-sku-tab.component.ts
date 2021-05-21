import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { CardHeaderActionConfig } from 'app/shared/components/card-header/models/card-header.model';
import { FormMode } from 'app/shared/models';
import { CatalogueSegmentation } from '../../models';

@Component({
    selector: 'app-catalogue-segmentation-assign-sku-tab',
    templateUrl: './catalogue-segmentation-assign-sku-tab.component.html',
    styleUrls: ['./catalogue-segmentation-assign-sku-tab.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationAssignSkuTabComponent implements OnChanges, OnInit {
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-4 mb-16',
        title: {
            label: 'Assign SKU',
        },
        batchAction: {
            actions: [],
            show: false,
        },
        search: {
            active: true,
        },
    };

    clickUnassignAllSelection: boolean = false;
    isShowSelectAllCatalogueAction: boolean = false;
    isResetAllCatalogue: boolean = false;
    isSelectAllCatalogue: boolean = false;
    keyword: string = null;

    @Input()
    formMode: FormMode;

    @Input()
    item: CatalogueSegmentation;

    @Input()
    isLoading: boolean;

    @Output()
    loadingCatalogueList: EventEmitter<boolean> = new EventEmitter();

    @Output()
    formModeChange: EventEmitter<void> = new EventEmitter();

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formMode']) {
            if (!changes['formMode'].isFirstChange()) {
                this.formModeChange.emit();
            }
        }
    }

    ngOnInit(): void {}

    onActionSelected(action: CardHeaderActionConfig): void {
        switch (action.id) {
            case 'select-all':
                this.isSelectAllCatalogue = true;
                break;

            case 'reset-all':
                this.isResetAllCatalogue = true;
                break;

            case 'unassigned-all-selection':
                this.clickUnassignAllSelection = true;
                break;

            default:
                break;
        }
    }

    onUpdateBatchActions({
        isShowBatchActions,
        totalItem,
    }: {
        isShowBatchActions: boolean;
        totalItem: number;
    }): void {
        let actions: CardHeaderActionConfig[] = [];

        if (isShowBatchActions) {
            if (this.formMode === 'add') {
                actions = [
                    {
                        id: 'select-all',
                        label: `Select all ${totalItem} product${totalItem > 1 ? 's' : ''}`,
                    },
                ];
            }

            if (this.formMode === 'edit') {
                actions = [
                    {
                        id: 'unassigned-all-selection',
                        label: 'Unassign',
                    },
                ];
            }

            actions = [
                ...actions,
                {
                    id: 'reset-all',
                    label: 'Reset Selection',
                },
            ];
        }

        this.cardHeaderConfig = {
            ...this.cardHeaderConfig,
            batchAction: {
                ...this.cardHeaderConfig.batchAction,
                actions,
                show: !!actions.length,
            },
        };
    }

    onLoadingCatalogueList(ev: boolean): void {
        this.loadingCatalogueList.emit(ev);
    }
}
