export interface ITab {
    readonly id: NonNullable<string>;
    disabled: boolean;
    hidden?: boolean;
    label: string;
}
