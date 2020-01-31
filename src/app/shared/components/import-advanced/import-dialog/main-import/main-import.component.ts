import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { LifecyclePlatform } from 'app/shared/models';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { IConfigImportAdvanced, IConfigMode, IConfigTemplate } from '../../models';
import { fromImportAdvanced } from '../../store/reducers';
import { ImportAdvancedSelectors } from '../../store/selectors';
import { ImportAdvancedActions } from '../../store/actions';

@Component({
    selector: 'app-main-import',
    templateUrl: './main-import.component.html',
    styleUrls: ['./main-import.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainImportComponent implements OnInit {
    form: FormGroup;

    config$: Observable<IConfigImportAdvanced>;
    modes$: Observable<Array<IConfigMode>>;
    templates$: Observable<Array<IConfigTemplate>>;

    @Input() pageType: string;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private formBuilder: FormBuilder,
        private store: Store<fromImportAdvanced.FeatureState>,
        public translate: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
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

    hasError(field: string, isMatError = false): boolean {
        if (!field) {
            return;
        }

        const errors = this.form.get(field).errors;
        const touched = this.form.get(field).touched;
        const dirty = this.form.get(field).dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }

    hasLength(field: string, minLength: number): boolean {
        if (!field || !minLength) {
            return;
        }

        const value = this.form.get(field).value;

        return !value ? true : value.length <= minLength;
    }

    onDownload(url: string): void {
        if (!url) {
            return;
        }

        window.open(url, '_blank');
    }

    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];
            const mode = this.form.get('mode').value;

            if (file) {
                switch (type) {
                    case 'docs':
                        console.log('DOCS', file, {});

                        if (this.pageType === 'oms' && mode) {
                            this.store.dispatch(
                                ImportAdvancedActions.importConfirmRequest({
                                    payload: { file, mode, type: this.pageType }
                                })
                            );
                        }

                        /* this.store.dispatch(
                            OrderActions.importRequest({
                                payload: { file, type: 'update_order_status' }
                            })
                        ); */
                        // {
                        //     const photoField = this.form.get('profileInfo.photos');
                        //     const fileReader = new FileReader();
                        //     fileReader.onload = () => {
                        //         photoField.patchValue(fileReader.result);
                        //         this.tmpPhoto.patchValue(file.name);
                        //     };
                        //     fileReader.readAsDataURL(file);
                        // }
                        break;

                    default:
                        break;
                }
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                break;

            default:
                this.modes$ = this.store.select(ImportAdvancedSelectors.getMode);
                this.templates$ = this.store.select(ImportAdvancedSelectors.getTemplate);

                this.store
                    .select(ImportAdvancedSelectors.getConfig)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(x => {
                        console.log('X', x);
                    });
                this._initForm();
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            mode: [
                '',
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                })
            ]
        });
    }
}
