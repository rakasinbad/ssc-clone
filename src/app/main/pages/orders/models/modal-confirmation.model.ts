export interface IModalConfirmation {
    type: TYPE_MODAL,
    title: string;
    message: string;
    txtButtonLeft?: string;
    txtButtonRight?: string;
}

export type TYPE_MODAL = 'CANCEL' | 'SUBMIT';
