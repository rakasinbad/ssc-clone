import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'app-catalogue-visibility',
    templateUrl: './catalogue-visibility.component.html',
    styleUrls: ['./catalogue-visibility.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueVisibilityComponent implements OnInit {
    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };

    formClass: {
        'custom-field-right': boolean;
        'view-field-right': boolean;
    };

    formModeValue: IFormMode = 'add';

    @Input()
    get formMode(): IFormMode {
        return this.formModeValue;
    }

    set formMode(mode: IFormMode) {
        this.formModeValue = mode;
        this.formModeChange.emit(this.formModeValue);
    }

    @Output()
    formModeChange: EventEmitter<IFormMode> = new EventEmitter<IFormMode>();

    constructor() {}

    ngOnInit() {}
}
