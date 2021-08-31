import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FuseSharedModule } from '@fuse/shared.module';
import { MaintenanceDialogComponent } from './maintenance-dialog.component';

@NgModule({
    declarations: [MaintenanceDialogComponent],
    imports: [
        CommonModule,

        // Fuse
        FuseSharedModule,

        // Material
        MatDialogModule,
        MatIconModule,
    ],
    exports: [MaintenanceDialogComponent],
    entryComponents: [MaintenanceDialogComponent],
})
export class MaintenanceDialogModule {}
