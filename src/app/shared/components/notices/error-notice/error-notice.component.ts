import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material';

@Component({
    selector: 'app-error-notice',
    template: `
        <div fxLayout="row">
            <ng-container *ngIf="data && data?.url; else default">
                <div fxFlexAlign="center" class="mr-4">
                    <mat-icon>info</mat-icon>
                </div>

                <div fxLayout="row">
                    <p fxFlexAlign="center" [innerHtml]="data?.message"></p>

                    <button
                        mat-button
                        fxFlexAlign="center"
                        class="ml-4"
                        (click)="downloadUrl(data?.url)"
                        *ngIf="data?.url"
                    >
                        Download
                    </button>
                </div>
            </ng-container>

            <ng-template #default>
                <div fxFlexAlign="center" class="mr-4">
                    <mat-icon>report</mat-icon>
                </div>

                <div>
                    <p [innerHtml]="data?.message"></p>
                </div>
            </ng-template>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorNoticeComponent {
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: any,
        public snackBarRef: MatSnackBarRef<ErrorNoticeComponent>
    ) {}

    downloadUrl(url: string): void {
        if (!url) {
            return;
        }

        window.open(url, '_blank');
        this.snackBarRef.dismiss();
    }
}
