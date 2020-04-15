import { TemplateRef } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { first } from 'rxjs/operators';

// Components
import { ApplyDialogComponent } from '../apply-dialog.component';

type DialogRef<T> = MatDialogRef<ApplyDialogComponent<T>>;

export class ApplyDialogService<T = undefined> {
    
    constructor(
        private dialogRef: DialogRef<T>
    ) {}
        
    closed$ = this.dialogRef.afterClosed().pipe(first());
    opened$ = this.dialogRef.afterOpened().pipe(first());

    get context(): T {
        return this.dialogRef.componentInstance.data.context;
    }

    close(): void {
        this.dialogRef.close();
    }

    setTitle(title: string): void {
        this.dialogRef.componentInstance.data.title = title;
    }

    setTemplate(template: TemplateRef<any>): void {
        this.dialogRef.componentInstance.data.template = template;
    }

    enableApply(): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.isApplyEnabled = true;
        });
    }

    disableApply(): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.isApplyEnabled = false;
        });
    }

    showApplyButton(): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.showApplyButton = true;
        });
    }

    hideApplyButton(): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.showApplyButton = false;
        });
    }
}
