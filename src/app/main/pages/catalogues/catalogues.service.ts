import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface ICatalogueTitleParameter {
    allCount: number;
    liveCount: number;
    emptyCount: number;
    blockedCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class CatalogueService {
    constructor(private translate: TranslateService) {}

    getCatalogueStatus(data: ICatalogueTitleParameter) {
        const {
            allCount,
            liveCount,
            emptyCount,
            blockedCount
        } = data;

        const STATUS_CATALOGUES_KEYS = [
            'STATUS.CATALOGUE.ALL_PARAM.TITLE',
            'STATUS.CATALOGUE.LIVE_PARAM.TITLE',
            'STATUS.CATALOGUE.EMPTY_PARAM.TITLE',
            'STATUS.CATALOGUE.BLOCKED_PARAM.TITLE',
            'STATUS.CATALOGUE.ARCHIVED.TITLE'
        ];

        return this.translate.instant(STATUS_CATALOGUES_KEYS, { allCount, liveCount, emptyCount, blockedCount });
    }

    // getErrorMessageNonState(field: string, type: string, args?: any): string {
    //     const labelName = this.translate.instant(`FORM.${field.toUpperCase()}`);

    //     this.logSvc.generateGroup(
    //         '[ERROR MESSAGE NON STATE]',
    //         {
    //             type: {
    //                 type: 'log',
    //                 value: type
    //             },
    //             field: {
    //                 type: 'log',
    //                 value: field
    //             },
    //             label: {
    //                 type: 'log',
    //                 value: labelName
    //             }
    //         },
    //         'groupCollapsed'
    //     );

    //     switch (type) {
    //         case 'alpha_pattern':
    //             return this.translate.instant('ERROR.ALPHA_PATTERN', { fieldName: labelName });

    //         case 'email_pattern':
    //             return this.translate.instant('ERROR.EMAIL_PATTERN', { fieldName: labelName });

    //         case 'max_length':
    //             return this.translate.instant('ERROR.MAX_LENGTH', {
    //                 fieldName: labelName,
    //                 maxValue: args
    //             });

    //         case 'mobile_phone_length_pattern':
    //             const { prefix, length } = args;

    //             return this.translate.instant('ERROR.MOBILE_PHONE_LENGTH_PATTERN', {
    //                 fieldName: labelName,
    //                 prefix,
    //                 length
    //             });

    //         case 'mobile_phone_pattern':
    //             return this.translate.instant('ERROR.MOBILE_PHONE_PATTERN', {
    //                 fieldName: labelName,
    //                 prefix: args
    //             });

    //         case 'pattern':
    //             return this.translate.instant('ERROR.PATTERN', { fieldName: labelName });

    //         case 'required':
    //             return this.translate.instant('ERROR.REQUIRED', { fieldName: labelName });

    //         case 'selected':
    //             return this.translate.instant('ERROR.SELECTED', { fieldName: labelName });

    //         default:
    //             break;
    //     }
    // }

    // getErrorMessageState(form: any, field: string): string {
    //     console.groupCollapsed('[ERROR MESSAGE STATE]');
    //     console.log(form);
    //     console.log(field);
    //     console.groupEnd();

    //     return 'Error';
    // }
}
