interface SelectionInformation {
    text: string;
    clickable: boolean;
}

export interface Selection {
    id: string;
    group: string;
    label: string;
    tooltip?: string;
    isSelected?: boolean;
    additionalInformation?: SelectionInformation;
    data?: any;
}
