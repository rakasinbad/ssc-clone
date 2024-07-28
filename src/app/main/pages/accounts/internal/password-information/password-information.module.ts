import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplyDialogModule } from 'app/shared/components/dialogs/apply-dialog/apply-dialog.module';
import { PasswordInformationComponent } from './password-information.component';
import { MatButtonModule, MatDialogModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';

/**
 *
 *
 * @export
 * @class PasswordInformationModule
 */
@NgModule({
    declarations: [PasswordInformationComponent],
    exports: [PasswordInformationComponent],
    entryComponents: [PasswordInformationComponent],
    imports: [CommonModule, MatDialogModule, FuseSharedModule, ApplyDialogModule, MatButtonModule],
})
export class PasswordInformationModule {}
