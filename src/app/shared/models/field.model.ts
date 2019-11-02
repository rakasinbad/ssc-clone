export enum FormStatus {
    INVALID,
    VALID
}

type FormStatusString = keyof typeof FormStatus;

export type TFormStatus = FormStatusString;

export interface Validator {
    name: string;
    validator: any;
    message: string;
}

export interface FieldConfig {
    label?: string;
    name?: string;
    inputType?: string;
    options?: string[];
    collections?: any;
    type: string;
    value?: any;
    validations?: Validator[];
}
