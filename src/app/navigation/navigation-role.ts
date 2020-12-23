interface Role {
    role : string,
    routing   : string[],
    navigation : string[],
    redirectTo : string
}

export const NavigationRoles : Role[] = [
    {
        role : "SUPER_SUPPLIER_ADMIN",
        navigation : ['*'],
        routing : [],
        redirectTo : "/pages/account/stores"
    },
    {
        role : "FINANCE",
        navigation : ['paymentStatus', 'orderManagement'],
        routing : [],
        redirectTo : "/pages/account/stores"
    },
    {
        role : "HEAD_OF_SALES",
        navigation : ['manageProduct', 'paymentStatus', 'orderManagement', 'instore', 'journey-plan'],
        routing : [],
        redirectTo : "/pages/account/stores"
    },
    {
        role : "BOS",
        navigation : ['manageProduct', 'attendance', 'paymentStatus', 'orderManagement', 'journey-plan'],
        routing : [],
        redirectTo : "/pages/account/stores"
    },
    {
        role : "COUNTRY_MANAGER",
        routing : [],
        navigation : ['manageProduct', 'attendance', 'paymentStatus', 'orderManagement', 'instore', 'journey-plan'],
        redirectTo : "/pages/account/stores"
    },
    { 
        role : "SUPPLIER_ADMIN",
        routing : [],
        navigation : ['manageProduct', 'attendance','orderManagement', 'instore', 'journey-plan'],
        redirectTo : "/pages/account/stores"
    },
    {
        role : "SALES_ADMIN_CABANG",
        routing : [],
        navigation : ['orderManagement'],
        redirectTo : "/pages/orders"
    }
]

export class NavigationRole {

    constructor(
        private navigationRole : Role[] = NavigationRoles
    ) {}

    public GetRoleByRouter = (key?: string) : string[] => {
        var role : Role[] = this.navigationRole.filter((value : Role) => {
            return value.routing.includes(key);
        });

        return role.map((value : Role) => {
            return value.role;
        });
    }

    public GetRoleByNavigation = (key?: string) : string[] => {
        var role : Role[] = this.navigationRole.filter((value : Role) => {
            return value.navigation.includes(key);
        });

        return role.map((value : Role) => {
            return value.role;
        });
    }

    public GetNavigationByRole = (key? : string) : string[] => {
        var role : Role[] = this.navigationRole.filter((value : Role) => {
            return value.role === key;
        });

        return role[0].navigation;
    } 

    public GetRoutingByRole = (key? : string) : string[] => {
        var role : Role[] = this.navigationRole.filter((value : Role) => {
            return value.role === key;
        });

        return role[0].routing;
    }
}