import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
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
        type: 'collapsable',
        icon: 'people',
        children: [
            {
                id: 'accountsStore',
                title: 'Store',
                translate: 'NAV.ACCOUNTS_STORE.TITLE',
                type: 'item',
                url: '/pages/account/stores'
            },
            {
                id: 'accountsInternal',
                title: 'Internal',
                translate: 'NAV.ACCOUNTS_INTERNAL.TITLE',
                type: 'item',
                url: '/pages/account/internal'
            }
        ]
    },
    {
        id: 'catalogues',
        title: 'Catalogues',
        translate: 'NAV.CATALOGUES.TITLE',
        type: 'collapsable',
        icon: 'people',
        children: [
            {
                id: 'addProduct',
                title: 'Add Product',
                translate: 'NAV.ADD_PRODUCT.TITLE',
                type: 'item',
                url: '/pages/catalogues/add'
            },
            {
                id: 'manageProduct',
                title: 'Manage Product',
                translate: 'NAV.MANAGE_PRODUCT.TITLE',
                type: 'item',
                url: '/pages/catalogues'
            }
        ]
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
        type: 'collapsable',
        icon: 'monetization_on',
        children: [
            {
                id: 'creditLimitBalance',
                title: 'Credit Limit/Balance',
                translate: 'NAV.CREDIT_LIMIT_BALANCE.TITLE',
                type: 'item',
                url: '/pages/finances/credit-limit-balance'
            },
            {
                id: 'banks',
                title: 'Set Bank',
                translate: 'NAV.SET_BANK.TITLE',
                type: 'item',
                url: '/pages/finances/banks'
            },
            {
                id: 'paymentStatus',
                title: 'Payment Status',
                translate: 'NAV.PAYMENT_STATUS.TITLE',
                type: 'item',
                url: '/pages/finances/payment-status'
            }
        ]
    },
    {
        id: 'orderManagements',
        title: 'Order Managements',
        translate: 'NAV.ORDER_MANAGEMENTS.TITLE',
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
];
