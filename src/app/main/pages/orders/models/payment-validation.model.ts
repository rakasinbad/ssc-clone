import { TNullable } from 'app/shared/models/global.model';
import { OrderBrandsInf } from './order-add.model';

export interface PaymentChannel {
    id: number;
    name: string;
}

export interface Validation {
    overLimitStatus: boolean;
    warningMessage: string;
    availableStatus: boolean;
}

interface IPaymentValidation {
    readonly id: NonNullable<number>;
    supplierId: number;
    paymentTypeId: number;
    name: string;
    paymentMethodId: number;
    paymentTypeSupplierId: number;
    paymentChannels: PaymentChannel[];
    validation: Validation;
}

export class PaymentValidation {
    readonly id: NonNullable<number>;
    supplierId: number;
    paymentTypeId: number;
    name: string;
    paymentMethodId: number;
    paymentTypeSupplierId: number;
    paymentChannels: PaymentChannel[];
    validation: Validation;

    constructor(data: IPaymentValidation) {
        const {
            id,
            supplierId,
            paymentTypeId,
            name,
            paymentMethodId,
            paymentTypeSupplierId,
            paymentChannels,
            validation,
        } = data;

        this.id = id;
        this.supplierId = supplierId;
        this.paymentTypeId = paymentTypeId;
        this.name = name;
        this.paymentMethodId = paymentMethodId;
        this.paymentTypeSupplierId = paymentTypeSupplierId;
        this.paymentChannels = paymentChannels;
        this.validation = validation;
    }
}

export class ParamPaymentVal {
    orderParcelId: string;
    brandName: OrderBrandsInf[];
}

export class PayloadOption {
    orderParcelId: string;
    selectedPaymentType: number;
    selectedPaymentChannel: number;
    paymentList: PaymentValidation[];

    constructor(data: PayloadOption) {
        const {
            orderParcelId,
            selectedPaymentType,
            selectedPaymentChannel,
            paymentList,
           
        } = data;

        this.orderParcelId = orderParcelId;
        this.selectedPaymentType = selectedPaymentType;
        this.selectedPaymentChannel = selectedPaymentChannel;
        this.paymentList = paymentList;
    }
}

