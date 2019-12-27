import { User } from 'app/shared/models';

export interface IAuth {
    user: User;
    token: string;
}

export class Auth implements IAuth {
    constructor(public user: User, public token: string) {
        this.user = user ? new User(user) : null;
    }
}
