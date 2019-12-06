import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';

@Component({
    selector: 'app-error-notice',
    template: `
        <div fxLayout="row">
            <div fxFlexAlign="center" class="mr-4">
                <mat-icon>report</mat-icon>
            </div>

            <div>
                <p [innerHtml]="data?.message"></p>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorNoticeComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
