import { User } from 'app/shared/models';

interface IAuth {
    user: User;
    token: string;
}

export class Auth implements IAuth {
    constructor(public user: User, public token: string) {
        if (user) {
            const newUser = new User(
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
                user.roles,
                user.createdAt,
                user.updatedAt,
                user.deletedAt
            );

            if (user.userStores) {
                newUser.userStores = user.userStores;
            }

            if (user.userSuppliers) {
                newUser.userSuppliers = user.userSuppliers;
            }

            if (user.urban) {
                newUser.urban = user.urban;
            }

            this.user = newUser;
        } else {
            this.user = null;
        }
    }
}
