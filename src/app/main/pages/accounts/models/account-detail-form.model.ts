import { prop } from '@rxweb/reactive-form-validators';

import { IAccount } from './account.model';

export class AccountDetailFormModel {
    @prop()
    fullName: string;

    @prop()
    email: string;

    @prop()
    mobilePhone: string;

    @prop()
    phone: string;

    // @prop()
    // fcm: string;

    @prop()
    status: string;

    constructor(data?: IAccount) {
        if (data) {
            this.fullName = data.fullName;
            this.email = data.email;
            this.mobilePhone = data.mobilePhoneNo;
            this.phone = data.phoneNo;
            // this.fcm = data.fcm;
            this.status = data.status;
        }
    }
}
