import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, ThemePalette } from '@angular/material';
import { take } from 'rxjs/operators';

import { ExportFilterComponent } from './export-filter/export-filter.component';

@Component({
    selector: 'app-export-advanced',
    templateUrl: './export-advanced.component.html',
    styleUrls: ['./export-advanced.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportAdvancedComponent {
    @Input() title: string;
    @Input() action: string;
    @Input() color?: ThemePalette;
    @Input() formConfig?: any;

    @Output() clickExport: EventEmitter<{ action: string; payload: any }> = new EventEmitter();

    constructor(private matDialog: MatDialog) {}

    onFilter(): void {
        const dialogRef = this.matDialog.open<
            ExportFilterComponent,
            any,
            { action: string; payload: any }
        >(ExportFilterComponent, {
            data: {
                dialog: {
                    title: 'Filter Export',
                    action: this.action
                },
                formConfig: this.formConfig
            },
            panelClass: 'event-form-dialog',
            disableClose: true
        });

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe(resp => {
                if (!resp) {
                    return;
                }

                const { action, payload } = resp;

                switch (action) {
                    case 'export':
                        this.clickExport.emit({ action, payload });
                        break;

                    default:
                        break;
                }
            });
    }
}
