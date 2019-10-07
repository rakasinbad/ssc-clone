import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material';

import { ErrorNoticeComponent } from '../components/notices/error-notice/error-notice.component';
import { SuccessNoticeComponent } from '../components/notices/success-notice/success-notice.component';
import { WarningNoticeComponent } from '../components/notices/warning-notice/warning-notice.component';
import { TStatusError } from '../models';

@Injectable({
    providedIn: 'root'
})
export class NoticeService {
    constructor(private matSnackBar: MatSnackBar) {}

    open(
        message: string,
        status: TStatusError,
        configCustom?: MatSnackBarConfig<any>
    ): MatSnackBarRef<any> {
        const config: MatSnackBarConfig<any> = {
            data: {
                message: message,
                status: status
            },
            duration: 5000,
            verticalPosition:
                configCustom && configCustom.verticalPosition
                    ? configCustom.verticalPosition
                    : 'top',
            horizontalPosition:
                configCustom && configCustom.horizontalPosition
                    ? configCustom.horizontalPosition
                    : 'center',
            panelClass:
                configCustom && configCustom.panelClass
                    ? configCustom.panelClass
                    : [`panel-${status}`]
        };

        switch (status) {
            case 'error':
                return this.matSnackBar.openFromComponent(ErrorNoticeComponent, config);

            case 'success':
                return this.matSnackBar.openFromComponent(SuccessNoticeComponent, config);

            case 'warning':
                return this.matSnackBar.openFromComponent(WarningNoticeComponent, config);
        }
    }
}
