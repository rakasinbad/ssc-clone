import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ITab } from 'app/shared/models';

import { IDialogData } from '../models';

@Component({
    templateUrl: './import-dialog.component.html',
    styleUrls: ['./import-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportDialogComponent implements OnInit {
    dialogTitle: string;
    cssToolbar: string | Array<string>;
    tabs: Array<ITab>;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: IDialogData,
        private matDialogRef: MatDialogRef<ImportDialogComponent>
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
}
