import { FormGroup } from '@angular/forms';

export type SinbadFilterActionType = 'reset' | 'submit';

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
    by?: any;
    form?: FormGroup;
    title?: NonNullable<string>;
}
