import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Portfolio } from 'app/shared/models';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { SalesRep } from '../../models';

@Component({
    selector: 'app-sales-rep-detail-info',
    templateUrl: './sales-rep-detail-info.component.html',
    styleUrls: ['./sales-rep-detail-info.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepDetailInfoComponent {
    @Input() salesRep: SalesRep;
    @Input() isLoading: boolean;

    constructor(private _fuseTranslationLoaderService: FuseTranslationLoaderService) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    isChecked(status: string): boolean {
        return status === 'active' ? true : false;
    }

    totalPortfolio(porfolios: Array<Portfolio>): number {
        return porfolios ? porfolios.length || 0 : 0;
    }
}
