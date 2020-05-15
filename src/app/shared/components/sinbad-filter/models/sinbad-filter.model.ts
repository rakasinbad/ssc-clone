export interface SinbadFilterAction {
    readonly id: NonNullable<string>;
    title: NonNullable<string>;
    color?: 'accent' | 'primary';
    class?: string;
    action: 'reset' | 'submit';
}

export interface SinbadFilterConfig {
    title: NonNullable<string>;
    actions?: SinbadFilterAction[];
}
