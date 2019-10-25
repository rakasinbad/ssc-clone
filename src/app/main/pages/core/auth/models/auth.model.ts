import { Account } from '../../../accounts/models';

export interface IAuth {
    user: Account;
    token: string;
}

export class Auth {
    data: Account;
    token: string;

    constructor(user: Account, token: string) {
        this.data = user
            ? {
                  ...new Account(
                      user.id,
                      user.fullName,
                      user.email,
                      user.phoneNo,
                      user.mobilePhoneNo,
                      user.idNo,
                      user.taxNo,
                      user.status,
                      user.imageUrl,
                      user.taxImageUrl,
                      user.idImageUrl,
                      user.selfieImageUrl,
                      user.urbanId,
                      user.userStores,
                      user.userBrands,
                      user.roles,
                      user.urban,
                      user.createdAt,
                      user.updatedAt,
                      user.deletedAt
                  )
              }
            : undefined;
        this.token = token;
    }
}
