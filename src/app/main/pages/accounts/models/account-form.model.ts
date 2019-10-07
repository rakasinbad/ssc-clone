import { prop, required, maxLength } from '@rxweb/reactive-form-validators';

export class AccountFormModel {
    @prop()
    @required()
    @maxLength({ value: 30 })
    fullName: string;

    @prop()
    @required()
    email: string;

    @prop()
    @required()
    mobilePhone: string;

    @prop()
    phone: string;

    @prop()
    @required()
    status: string;

    constructor() {}
}
