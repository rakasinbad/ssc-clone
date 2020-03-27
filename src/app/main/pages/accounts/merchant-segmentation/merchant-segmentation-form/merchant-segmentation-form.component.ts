import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { LifecyclePlatform } from 'app/shared/models/global.model';

@Component({
    selector: 'app-merchant-segmentation-form',
    templateUrl: './merchant-segmentation-form.component.html',
    styleUrls: ['./merchant-segmentation-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantSegmentationFormComponent implements OnInit {
    form: FormGroup;
    dialogTitle: string;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any, private formBuilder: FormBuilder) {
        this.dialogTitle = this.data.title;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                break;

            default:
                this._initForm();
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            branchId: null,
            branchName: [null],
            desc: null
        });
    }
}
