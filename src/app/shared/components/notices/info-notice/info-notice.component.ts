import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

@Component({
    template: `
        <div fxLayout="row">
            <div fxFlexAlign="center" class="mr-4">
                <mat-icon>info</mat-icon>
            </div>

            <div fxLayout="row">
                <p fxFlexAlign="center">{{ data?.message }}</p>

                <button
                    mat-flat-button
                    fxFlexAlign="center"
                    class="ml-4"
                    (click)="snackBarRef.dismissWithAction()"
                    *ngIf="data?.isNewVersion"
                >
                    Update
                </button>
            </div>
        </div>
    `,
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoNoticeComponent implements OnInit {
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: any,
        public snackBarRef: MatSnackBarRef<InfoNoticeComponent>
    ) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}
