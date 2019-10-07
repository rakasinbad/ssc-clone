import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';

@Component({
    selector: 'app-warning-notice',
    template: `
        <div fxLayout="row">
            <div fxFlexAlign="center" class="mr-4">
                <mat-icon>warning</mat-icon>
            </div>

            <div>
                <p>{{ data?.message }}</p>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarningNoticeComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
