import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnInit,
    Renderer2,
    ViewChild
} from '@angular/core';
import { MatDialog, ThemePalette } from '@angular/material';
import { Store } from '@ngrx/store';
import { NoticeService } from 'app/shared/helpers';
import { ButtonDesignType, ITab, LifecyclePlatform } from 'app/shared/models';
import { take } from 'rxjs/operators';

import { ImportDialogComponent } from './import-dialog/import-dialog.component';
import { IButtonImportConfig, IDialogData } from './models';
import { fromImportAdvanced } from './store/reducers';
import { ImportAdvancedActions } from './store/actions';

@Component({
    selector: 'sinbad-import-advanced',
    templateUrl: './import-advanced.component.html',
    styleUrls: ['./import-advanced.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportAdvancedComponent implements OnInit, AfterViewInit {
    BtnDesignType = ButtonDesignType;

    @Input() pageType: string;
    @Input() title?: string;
    @Input() action?: string;
    @Input() color?: ThemePalette;
    @Input() formConfig?: any;
    @Input() btnConfig: IButtonImportConfig;

    @ViewChild('importBtn', { read: ElementRef, static: false }) private importBtn: ElementRef;

    private _tabs: Array<ITab> = [
        {
            id: 'import',
            label: 'Import',
            disabled: false
        },
        {
            id: 'import-history',
            label: 'Import History',
            disabled: false
        },
        {
            id: 'template-history',
            label: 'Template History',
            disabled: false
        }
    ];

    constructor(
        private matDialog: MatDialog,
        private renderer: Renderer2,
        private store: Store<fromImportAdvanced.FeatureState>,
        private _$notice: NoticeService
    ) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    onSetup(): void {
        if (!this.pageType || typeof this.pageType !== 'string') {
            this._$notice.open('Please set page type first!', 'error', {
                verticalPosition: 'bottom',
                horizontalPosition: 'right'
            });
            return;
        }

        const pageType = this.pageType.toLowerCase();

        this.store.dispatch(ImportAdvancedActions.importConfigRequest({ payload: pageType }));

        const dialogRef = this.matDialog.open<ImportDialogComponent, IDialogData>(
            ImportDialogComponent,
            {
                data: {
                    dialog: {
                        title: this.btnConfig.dialogConf.title || 'Import',
                        cssToolbar: this.btnConfig.dialogConf.cssToolbar || null
                    },
                    pageType: this.pageType,
                    formConfig: this.formConfig,
                    tabConfig: this._tabs
                },
                panelClass: 'event-form-dialog',
                disableClose: true,
                autoFocus: false
            }
        );

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe(resp => {
                if (!resp) {
                    return;
                }

                console.log('RESP');

                //    const { action, payload } = resp;

                //    switch (action) {
                //        case 'export':
                //         //    this.clickExport.emit({ action, payload });
                //            break;

                //        default:
                //            break;
                //    }
            });
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                if (this.importBtn) {
                    if (this.btnConfig && this.btnConfig.cssClass) {
                        if (typeof this.btnConfig.cssClass === 'string') {
                            this.renderer.addClass(
                                this.importBtn.nativeElement,
                                this.btnConfig.cssClass
                            );
                        } else if (this.btnConfig.cssClass.length > 0) {
                            this.btnConfig.cssClass.forEach(x => {
                                this.renderer.addClass(this.importBtn.nativeElement, x);
                            });
                        }
                    }
                }
                break;

            default:
                {
                }
                break;
        }
    }
}
