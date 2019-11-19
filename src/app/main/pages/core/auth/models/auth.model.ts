import { User } from 'app/shared/models';

interface IAuth {
    user: User;
    token: string;
}

export class Auth implements IAuth {
    constructor(private _user: User, private _token: string) {}

    get user(): User {
        return this._user;
    }

    set user(value: User) {
        this._user = value;
    }

    get token(): string {
        return this._token;
    }

    set token(value: string) {
        this._token = value;
    }
}

// export class Auth {
//     data: User;
//     token: string;

//     constructor(user: Account, token: string) {
//         this.data = user
//             ? {
//                   ...new Account(
//                       user.id,
//                       user.fullName,
//                       user.email,
//                       user.phoneNo,
//                       user.mobilePhoneNo,
//                       user.idNo,
//                       user.taxNo,
//                       user.status,
//                       user.imageUrl,
//                       user.taxImageUrl,
//                       user.idImageUrl,
//                       user.selfieImageUrl,
//                       user.urbanId,
//                       user.userStores,
//                       user.userBrands,
//                       user.roles,
//                       user.urban,
//                       user.createdAt,
//                       user.updatedAt,
//                       user.deletedAt
//                   )
//               }
//             : undefined;
//         this.token = token;
//     }
// }
