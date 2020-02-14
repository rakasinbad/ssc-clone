import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
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
import { takeUntil, withLatestFrom } from 'rxjs/operators';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import {
    IConfigImportAdvanced,
    IConfigMode,
    IConfigTemplate,
    IConfigTemplateSource
} from '../../models';
import { ImportAdvancedActions, TemplateHistoryActions } from '../../store/actions';
import { fromImportAdvanced } from '../../store/reducers';
import { ImportAdvancedSelectors } from '../../store/selectors';

@Component({
    selector: 'app-main-import',
    templateUrl: './main-import.component.html',
    styleUrls: ['./main-import.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainImportComponent implements OnInit, OnDestroy {
    form: FormGroup;
    importSub$: Subject<{ $event: Event; type: string }> = new Subject();

    config$: Observable<IConfigImportAdvanced>;
    modes$: Observable<Array<IConfigMode>>;
    templates$: Observable<Array<IConfigTemplate>>;
    isLoading$: Observable<boolean>;

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

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
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

    onDownload({ fileUrl: url, type }: IConfigTemplateSource): void {
        if (!url || !this.pageType) {
            return;
        }

        this.store.dispatch(
            TemplateHistoryActions.createTemplateHistoryRequest({
                payload: {
                    url,
                    action: type,
                    page: this.pageType,
                    type: 'export_template',
                    status: 'done',
                    userId: null
                }
            })
        );

        this.store
            .select(ImportAdvancedSelectors.getIsDownload)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(isDownload => {
                if (isDownload) {
                    window.open(url, '_blank');
                }
            });
    }

    onFileBrowse(ev: Event, type: string): void {
        this.importSub$.next({
            $event: ev,
            type
        });
        // const inputEl = ev.target as HTMLInputElement;

        // const stateConfig = this.importSub$.pipe(
        //     withLatestFrom(this.store.select(ImportAdvancedSelectors.getConfig)),
        //     takeUntil(this._unSubs$)
        // ).toPromise();

        // return stateConfig.then(([{ $event }, config]) => {

        // });

        // if (inputEl.files && inputEl.files.length > 0) {
        //     const file = inputEl.files[0];
        //     const mode = this.form.get('mode').value;

        //     if (file) {
        //         switch (type) {
        //             case 'docs':
        //                 this._handlePage(file, mode);

        //                 /* this.store.dispatch(
        //                     OrderActions.importRequest({
        //                         payload: { file, type: 'update_order_status' }
        //                     })
        //                 ); */
        //                 // {
        //                 //     const photoField = this.form.get('profileInfo.photos');
        //                 //     const fileReader = new FileReader();
        //                 //     fileReader.onload = () => {
        //                 //         photoField.patchValue(fileReader.result);
        //                 //         this.tmpPhoto.patchValue(file.name);
        //                 //     };
        //                 //     fileReader.readAsDataURL(file);
        //                 // }
        //                 break;

        //             default:
        //                 break;
        //         }
        //     }
        // }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                this.store.dispatch(ImportAdvancedActions.resetImportConfig());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.store.dispatch(
                    ImportAdvancedActions.importConfigRequest({
                        payload: this.pageType.toLowerCase()
                    })
                );

                this.modes$ = this.store.select(ImportAdvancedSelectors.getMode);
                this.templates$ = this.store.select(ImportAdvancedSelectors.getTemplate);
                this.isLoading$ = this.store.select(ImportAdvancedSelectors.getIsLoading);

                this._initForm();

                this.store
                    .select(ImportAdvancedSelectors.getIsLoading)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(isLoading => {
                        if (isLoading) {
                            this.form.disable();
                        } else {
                            this.form.enable();
                            this.form.reset();
                        }
                    });

                this.importSub$
                    .pipe(
                        withLatestFrom(this.store.select(ImportAdvancedSelectors.getConfig)),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(([{ $event }, config]) => {
                        const inputEl = $event.target as HTMLInputElement;

                        if (inputEl.files && inputEl.files.length > 0) {
                            const file = inputEl.files[0];
                            const mode = this.form.get('mode').value;

                            if (file) {
                                if (config.mode) {
                                    const modeIds = config.mode.map(configMode => configMode.id);

                                    if (modeIds.includes(mode)) {
                                        this._handlePage(file, mode);
                                    }
                                }
                            }
                        }
                    });
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

    private _handlePage(file: File, mode: string): void {
        switch (this.pageType) {
            case 'payments':
            case 'orders':
                this.store.dispatch(
                    ImportAdvancedActions.importConfirmRequest({
                        payload: {
                            file,
                            page: this.pageType,
                            type: mode,
                            endpoint: 'import-order-parcels'
                        }
                    })
                );
                break;

            case 'catalogues':
                this.store.dispatch(
                    ImportAdvancedActions.importConfirmRequest({
                        payload: {
                            file,
                            page: this.pageType,
                            type: mode,
                            endpoint: 'import-catalogues'
                        }
                    })
                );
                break;

            case 'journey-plans':
                this.store.dispatch(
                    ImportAdvancedActions.importConfirmRequest({
                        payload: {
                            file,
                            page: this.pageType,
                            type: mode,
                            endpoint: 'import-journey-plans'
                        }
                    })
                );
                break;

            case 'stores':
                this.store.dispatch(
                    ImportAdvancedActions.importConfirmRequest({
                        payload: {
                            file,
                            page: this.pageType,
                            type: mode,
                            endpoint: 'import-stores'
                        }
                    })
                );
                break;

            default:
                break;
        }
    }
}
