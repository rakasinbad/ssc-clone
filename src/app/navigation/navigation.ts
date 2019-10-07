import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'applications',
        title: 'Applications',
        translate: 'NAV.APPLICATIONS',
        type: 'group',
        children: [
            {
                id: 'dashboard',
                title: 'Dashboard',
                translate: 'NAV.DASHBOARD.TITLE',
                type: 'item',
                icon: 'dashboard',
                url: '/pages/dashboard'
            },
            {
                id: 'accounts',
                title: 'Accounts',
                translate: 'NAV.ACCOUNTS.TITLE',
                type: 'item',
                icon: 'people',
                url: '/pages/accounts'
            },
            {
                id: 'attendances',
                title: 'Attendances',
                translate: 'NAV.ATTENDANCES.TITLE',
                type: 'item',
                icon: 'event_available',
                url: '/pages/attendances'
            },
            {
                id: 'finances',
                title: 'Finances',
                translate: 'NAV.FINANCES.TITLE',
                type: 'item',
                icon: 'monetization_on',
                url: '/pages/finances'
            },
            {
                id: 'orders',
                title: 'Orders',
                translate: 'NAV.ORDERS.TITLE',
                type: 'item',
                icon: 'shopping_cart',
                url: '/pages/orders'
            },
            {
                id: 'inventories',
                title: 'Inventories',
                translate: 'NAV.INVENTORIES.TITLE',
                type: 'collapsable',
                icon: 'layers',
                children: [
                    {
                        id: 'instore',
                        title: 'In Store',
                        translate: 'NAV.IN_STORE_INVENTORIES.TITLE',
                        type: 'item',
                        url: '/pages/in-store-inventories',
                        exactMatch: true
                    }
                ]
            }
        ]
    }
];
