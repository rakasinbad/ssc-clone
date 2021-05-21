import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { FormMode } from 'app/shared/models';
import { CatalogueSegmentation } from '../../models';

@Component({
    selector: 'app-catalogue-segmentation-information-tab',
    templateUrl: './catalogue-segmentation-information-tab.component.html',
    styleUrls: ['./catalogue-segmentation-information-tab.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationInformationTabComponent implements OnChanges, OnInit {
    keyword: string = null;

    @Input()
    formMode: FormMode;

    @Input()
    item: CatalogueSegmentation;

    @Input()
    isLoading: boolean;

    @Output()
    formModeChange: EventEmitter<void> = new EventEmitter();

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        console.log('[ngOnChanges] CatalogueSegmentationInformationTabComponent', { changes });

        if (changes['formMode']) {
            if (!changes['formMode'].isFirstChange()) {
                this.formModeChange.emit();
            }
        }
    }

    ngOnInit(): void {}
}
