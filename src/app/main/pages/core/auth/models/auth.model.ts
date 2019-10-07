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
                      user.status,
                      user.imageUrl,
                      user.urbanId,
                      user.userOdooId,
                      user.userStores,
                      user.roles,
                      user.attendances,
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
