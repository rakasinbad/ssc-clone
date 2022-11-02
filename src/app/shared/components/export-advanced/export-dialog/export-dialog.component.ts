import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ITab } from 'app/shared/models/tab.model';

import { IDialogData } from '../models';

@Component({
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportDialogComponent implements OnInit {
    selectedTabIndex = 0; // default 0
    dialogTitle: string;
    exportContext = { $implicit: this.data.pageType };
    cssToolbar: string | Array<string>;
    tabs: Array<ITab>;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: IDialogData,
        private matDialogRef: MatDialogRef<ExportDialogComponent>
    ) {
        this.dialogTitle = this.data.dialog.title;
        this.cssToolbar = this.data.dialog.cssToolbar;
        this.tabs = this.data.tabConfig;
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }

    onClose(): void {
        if (!this.matDialogRef) {
            return;
        }

        this.matDialogRef.close();
    }

    onSelectedTabIndex(tab: number) {
        this.selectedTabIndex = tab;
    }
}
