import { ErrorMessageService } from './../../../../shared/helpers/error-message.service';
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    templateUrl: './order-qty-form.component.html',
    styleUrls: ['./order-qty-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderQtyFormComponent implements OnInit {
    form: FormGroup;
    pageType: string;
    editorConfig = {
        modules: {
            toolbar: [
                // toggled buttons
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],

                // custom button values
                // [{ 'header': 1 }, { 'header': 2 }],
                [{ list: 'ordered' }, { list: 'bullet' }],

                // superscript/subscript
                // [{ 'script': 'sub' }, { 'script': 'super' }],

                // outdent/indent
                // [{ 'indent': '-1' }, { 'indent': '+1' }],

                // text direction
                // [{ 'direction': 'rtl' }],

                // custom dropdown
                // [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ header: [1, 2, 3, 4, 5, 6, false] }],

                // dropdown with defaults from theme
                [{ color: [] }, { background: [] }],
                [{ font: [] }],
                [{ align: [] }],

                // remove formatting button
                ['clean'],

                // link and image, video
                ['link', 'image']
            ]
        }
    };

    constructor(
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _$errorMessage: ErrorMessageService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        if (this.data.id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }

        this.form = this.formBuilder.group({
            qty: [''],
            content: ['']
        });

        if (this.pageType === 'edit') {
            if (this.data.qty) {
                this.form.get('qty').patchValue(this.data.qty);
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

    onSubmit(action: string): void {}
}
