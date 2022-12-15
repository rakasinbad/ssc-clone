import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CatalogueActions } from '../store/actions';
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';

@Component({
    selector: 'app-catalogues-import',
    templateUrl: './catalogues-import.component.html',
    styleUrls: ['./catalogues-import.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesImportComponent implements OnInit {
    subs: Subject<void>;
    form: FormGroup;
    isBlocking = false;

    @ViewChild('file', { static: false }) file: ElementRef;

    constructor(
        private formBuilder: FormBuilder,
        private _cd: ChangeDetectorRef,
        private matDialog: MatDialog,
        private store: Store<fromCatalogue.FeatureState>,
        private errorMessageSvc: ErrorMessageService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
        this.subs = new Subject<void>();
        this.form = this.formBuilder.group({
            //   limit: [''],
            //   balance: [''],
            //   top: ['']
            file: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.extension({
                        extensions: ['csv'],
                        message: this.errorMessageSvc.getErrorMessageNonState(
                            'default',
                            'mismatch_extension',
                            { extensions: ['csv'] }
                        )
                    })
                ]
            ],
            fileName: [{ value: '', disabled: true }]
        });

        this.store
            .select(CatalogueSelectors.getIsLoading)
            .pipe(takeUntil(this.subs))
            .subscribe(status => {
                this.isBlocking = !!status;
                this._cd.markForCheck();
            });
    }

    onFileBrowse($event: Event): void {
        const inputEl = $event.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file: File = inputEl.files[0];

            const fileReader = new FileReader();

            fileReader.onload = () => {
                this.form.patchValue({
                    file,
                    fileName: file.name
                });
                this.form.markAsTouched();
                this._cd.markForCheck();
            };

            fileReader.readAsDataURL(file);
        }

        return;
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessageSvc.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
        const { ignoreTouched, ignoreDirty } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return form.errors && form.touched;
        }

        if (ignoreTouched) {
            return form.errors && form.dirty;
        }

        return form.errors && (form.dirty || form.touched);
    }

    close(): void {
        this.matDialog.closeAll();
    }

    submit(): void {
        this.store.dispatch(
            CatalogueActions.importCataloguesRequest({
                payload: {
                    file: this.form.get('file').value,
                    type: 'update_current_stock'
                }
            })
        );
    }
}
