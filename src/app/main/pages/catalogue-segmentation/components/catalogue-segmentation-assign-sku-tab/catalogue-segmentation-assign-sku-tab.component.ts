import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { CardHeaderActionConfig } from 'app/shared/components/card-header/models/card-header.model';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { FormMode } from 'app/shared/models';
import { Catalogue, CatalogueSegmentation } from '../../models';

@Component({
    selector: 'app-catalogue-segmentation-assign-sku-tab',
    templateUrl: './catalogue-segmentation-assign-sku-tab.component.html',
    styleUrls: ['./catalogue-segmentation-assign-sku-tab.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationAssignSkuTabComponent implements OnChanges, OnInit {
    @Input()
    form: FormGroup;

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

    @ViewChild('availableCatalogueModal', { static: false })
    availableCatalogueModal: TemplateRef<any>;

    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-4 mb-16 card-header-assign-sku',
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

    addPermissions: string[] = null;
    clickUnassignAllSelection: boolean = false;
    isShowSelectAllCatalogueAction: boolean = false;
    isResetAllCatalogue: boolean = false;
    isSelectAllCatalogue: boolean = false;
    keyword: string = null;

    constructor(
        private readonly cdRef: ChangeDetectorRef,
        private applyDialogFactoryService: ApplyDialogFactoryService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formMode']) {
            if (!changes['formMode'].isFirstChange()) {
                if (changes['formMode'].currentValue === 'edit') {
                    this.cardHeaderConfig = {
                        ...this.cardHeaderConfig,
                        add: {
                            label: 'Add Product',
                            permissions: [],
                        },
                    };

                    this.addPermissions = this.cardHeaderConfig.add.permissions;
                } else {
                    this.addPermissions = null;

                    delete this.cardHeaderConfig.add;

                    this.cardHeaderConfig = {
                        ...this.cardHeaderConfig,
                    };
                }

                this.formModeChange.emit();
            }
        }
    }

    ngOnInit(): void {}

    onActionSelected(action: CardHeaderActionConfig): void {
        if (this.formMode !== 'edit') {
            return;
        }

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

    onCatalogueSelected(ev: Catalogue[] | 'all'): void {
        const chosenCatalogueCtrl = this.form.get('chosenCatalogue');

        chosenCatalogueCtrl.markAsDirty();
        chosenCatalogueCtrl.markAsTouched();

        if (!ev.length && ev !== 'all') {
            chosenCatalogueCtrl.setValue(null);
        } else {
            const newCatalogue: string[] | 'all' = ev === 'all' ? ev : ev.map((item) => item.id);

            chosenCatalogueCtrl.setValue(newCatalogue);
        }
    }

    onClickAdd(): void {
        const dialogRef = this.applyDialogFactoryService.open(
            {
                title: 'Add Product',
                template: this.availableCatalogueModal,
                isApplyEnabled: true,
                showApplyButton: true,
                showCloseButton: true,
                applyButtonLabel: 'Save',
                closeButtonLabel: 'Cancel',
            },
            {
                autoFocus: false,
                restoreFocus: false,
                disableClose: true,
                width: '50vw',
                minWidth: '50vw',
                maxWidth: '60vw',
                height: '80vh',
                maxHeight: '730px',
                panelClass: ['dialog-container-no-padding', 'available-catalogue-modal'],
            }
        );

        dialogRef.closed$.subscribe((res) => {
            /* if (res === 'apply') {
                this.catalogueSegmentationFacade.patchCatalogueSegmentation(
                    { segmentationIds: [item.segmentationId] },
                    this.segmentationId
                );
            }

            this.selectedId = null; */
            this.cdRef.markForCheck();
        });
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
