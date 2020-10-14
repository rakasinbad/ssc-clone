import { TemplateRef } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';

// Components
import { ApplyDialogComponent } from '../apply-dialog.component';

type DialogRef<T> = MatDialogRef<ApplyDialogComponent<T>>;

export class ApplyDialogService<T = undefined> {
    private applied: Subject<string> = new Subject<string>();
    private closed: Subject<string> = new Subject<string>();

    constructor(
        private dialogRef: DialogRef<T>
    ) {
        this.service = this;
    }
        
    closed$ = this.dialogRef.afterClosed().pipe(first());
    opened$ = this.dialogRef.afterOpened().pipe(first());

    get context(): T {
        return this.dialogRef.componentInstance.data.context;
    }

    get applyValue(): string {
        return this.dialogRef.componentInstance.data.applyValue;
    }

    get closeValue(): string {
        return this.dialogRef.componentInstance.data.closeValue;
    }

    get service(): ApplyDialogService<T> {
        return this.dialogRef.componentInstance.data.service;
    }

    set service(value: ApplyDialogService<T>) {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.service = value;
        });
    }

    apply(): void {
        if (!this.dialogRef) {
            return;
        }

        this.dialogRef.close(this.applyValue);
    }

    close(): void {
        if (!this.dialogRef) {
            return;
        }

        this.dialogRef.close(this.closeValue);
    }

    _apply(): void {
        if (!this.dialogRef) {
            return;
        }

        const { applyValue } = this.dialogRef.componentInstance.data;

        this.applied.next(applyValue);
    }

    _close(): void {
        if (!this.dialogRef) {
            return;
        }

        const { closeValue } = this.dialogRef.componentInstance.data;

        this.closed.next(closeValue);
    }

    onApply(): Observable<string> {
        return this.applied.asObservable();
    }

    onClose(): Observable<string> {
        return this.closed.asObservable();
    }

    setTitle(title: string): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.title = title;
        });
    }

    setTemplate(template: TemplateRef<any>): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.template = template;
        });
    }
    
    setApplyValue(value: string): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.applyValue = value;
        });
    }

    setCloseValue(value: string): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.closeValue = value;
        });
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

    showCloseButton(): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.showCloseButton = true;
        });
    }

    hideCloseButton(): void {
        setTimeout(() => {
            this.dialogRef.componentInstance.data.showCloseButton = false;
        });
    }
}
