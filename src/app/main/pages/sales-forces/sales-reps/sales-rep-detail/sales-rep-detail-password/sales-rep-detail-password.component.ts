import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';

@Component({
    selector: 'app-sales-rep-detail-password',
    templateUrl: './sales-rep-detail-password.component.html',
    styleUrls: ['./sales-rep-detail-password.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepDetailPasswordComponent {
    constructor(private _fuseTranslationLoaderService: FuseTranslationLoaderService) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }
}
