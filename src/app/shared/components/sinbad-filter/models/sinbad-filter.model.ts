import { FormGroup } from '@angular/forms';
import moment from 'moment';

export type SinbadFilterActionType = 'reset' | 'submit';
export type TFilterResetCheckbox = 'sourcePaymentType'|'sourcePayLaterType';

export interface SinbadFilterBy {
    [key: string]: {
        sources: any[];
        title?: string;
        numberLimitMax?: number;
    };
}

export interface SinbadFilterAction {
    readonly id: NonNullable<string>;
    action: SinbadFilterActionType;
    title: NonNullable<string>;
    class?: string;
    color?: 'accent' | 'primary';
}

export interface SinbadFilterConfig {
    showFilter: boolean;
    actions?: SinbadFilterAction[];
    by?: SinbadFilterBy;
    form?: FormGroup;
    title?: NonNullable<string>;
}
