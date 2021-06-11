import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormMode, FormStatus } from 'app/shared/models';
import { CatalogueSegmentation, PatchCatalogueSegmentationInfoDto } from '../../models';
import { CatalogueSegmentationFacadeService } from '../../services';

@Component({
    selector: 'app-catalogue-segmentation-information-tab',
    templateUrl: './catalogue-segmentation-information-tab.component.html',
    styleUrls: ['./catalogue-segmentation-information-tab.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationInformationTabComponent implements OnChanges, OnInit {
    @Input()
    form: FormGroup;

    @Input()
    formMode: FormMode;

    @Input()
    item: CatalogueSegmentation;

    @Input()
    isLoading: boolean;

    @Output()
    formModeChange: EventEmitter<void> = new EventEmitter();

    @Output()
    formStatus: EventEmitter<FormStatus> = new EventEmitter();

    @Output()
    updateFormValue: EventEmitter<PatchCatalogueSegmentationInfoDto> = new EventEmitter();

    constructor(private readonly catalogueSegmentationFacade: CatalogueSegmentationFacadeService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formMode']) {
            if (!changes['formMode'].isFirstChange()) {
                this.formModeChange.emit();
            }
        }
    }

    ngOnInit(): void {}

    onSetFormStatus(status: FormStatus): void {
        this.formStatus.emit(status);
    }

    onUpdateFormValue(payload: PatchCatalogueSegmentationInfoDto): void {
        this.updateFormValue.emit(payload);
    }
}
