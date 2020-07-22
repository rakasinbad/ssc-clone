import { TemplateRef, Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

// Components
import { ApplyDialogComponent } from '../apply-dialog.component';
import { ApplyDialogService } from './apply-dialog.service';
import { ApplyDialog } from '../models/apply-dialog.model';

@Injectable({
    providedIn: 'root'
})
export class ApplyDialogFactoryService<T = undefined> {
    constructor(private dialog: MatDialog) {}

    open(dialogData: ApplyDialog, options: any): ApplyDialogService<T> {
        const dialogRef = this.dialog.open<ApplyDialogComponent<T>, any>(
            ApplyDialogComponent,
            {
                ...options,
                data: {
                    ...dialogData,
                    applyValue: dialogData.applyValue ? dialogData.applyValue : 'apply',
                    closeValue: dialogData.closeValue ? dialogData.closeValue : null,
                    showApplyButton: !dialogData.showApplyButton
                                    && dialogData.showApplyButton !== false ? true
                                    : dialogData.showApplyButton,
                    showCloseButton: !dialogData.showCloseButton
                                    && dialogData.showCloseButton !== false ? true
                                    : dialogData.showCloseButton,
                }
            }
        );

        dialogRef.afterClosed().pipe(first());

        return new ApplyDialogService<T>(dialogRef);
    }
}
