export interface MaxOrderQtySegmentationDto {
    readonly id: NonNullable<string>;
    isMaximum: boolean;
    maxQty: number;
}
