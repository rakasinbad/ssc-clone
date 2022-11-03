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
// import { CatalogueActions } from 'app/main/pages/catalogues/store/actions';
import { NoticeService } from 'app/shared/helpers';
import { ButtonDesignType } from 'app/shared/models/button.model';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { ITab } from 'app/shared/models/tab.model';
import { take } from 'rxjs/operators';

import { ExportDialogComponent, } from './export-dialog/export-dialog.component';
import { IButtonExportConfig, IDialogData, ExportConfigurationPage } from './models';

@Component({
    selector: 'sinbad-export-advanced',
    templateUrl: './export-advanced.component.html',
    styleUrls: ['./export-advanced.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportAdvancedComponent implements OnInit, AfterViewInit {
    BtnDesignType = ButtonDesignType;

    @Input() pageType: ExportConfigurationPage;
    @Input() title?: string;
    @Input() action?: string;
    @Input() color?: ThemePalette;
    @Input() formConfig?: any;
    @Input() btnConfig: IButtonExportConfig;
    @Input() useMedeaGo: boolean = false;

    @ViewChild('exportBtn', { read: ElementRef, static: false }) private exportBtn: ElementRef;

    private _tabs: Array<ITab> = [
        {
            id: 'main-data',
            label: 'Export',
            disabled: false
        },
        {
            id: 'history',
            label: 'History',
            disabled: false
        }
    ];

    constructor(
        private matDialog: MatDialog,
        private renderer: Renderer2,
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

        if (this.pageType === 'payments') {
            this._tabs[0].label = 'Data';
            this._tabs.splice(1, 0, {
                id: 'invoice',
                label: 'Invoice',
                disabled: false
            });
        }
        
        const dialogRef = this.matDialog.open<ExportDialogComponent, IDialogData>(
            ExportDialogComponent,
            {
                data: {
                    dialog: {
                        title: this.btnConfig.dialogConf.title || 'Export',
                        cssToolbar: this.btnConfig.dialogConf.cssToolbar || null
                    },
                    pageType: this.pageType,
                    formConfig: this.formConfig,
                    tabConfig: this._tabs,
                    useMedeaGo: this.useMedeaGo
                },
                maxWidth: '80vw',
                maxHeight: '80vh',
                panelClass: 'event-form-export-advanced-dialog',
                disableClose: true,
                autoFocus: false
            }
        );

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe(resp => {
                if (this.pageType === 'catalogues') {
                    // this.store.dispatsch(CatalogueActions.setRefreshStatus({ status: true }));
                }

                if (!resp) {
                    return;
                }

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
                if (this.exportBtn) {
                    if (this.btnConfig && this.btnConfig.cssClass) {
                        if (typeof this.btnConfig.cssClass === 'string') {
                            this.renderer.addClass(
                                this.exportBtn.nativeElement,
                                this.btnConfig.cssClass
                            );
                        } else if (this.btnConfig.cssClass.length > 0) {
                            this.btnConfig.cssClass.forEach(x => {
                                this.renderer.addClass(this.exportBtn.nativeElement, x);
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
