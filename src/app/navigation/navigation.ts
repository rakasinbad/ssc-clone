import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    // {
    //     id: 'dashboard',
    //     title: 'Dashboard',
    //     translate: 'NAV.DASHBOARD.TITLE',
    //     type: 'item',
    //     icon: 'dashboard',
    //     url: '/pages/dashboard'
    // },
    {
        id: 'account',
        title: 'Account',
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
            }
            // {
            //     id: 'accountsInternal',
            //     title: 'Internal',
            //     translate: 'NAV.ACCOUNTS_INTERNAL.TITLE',
            //     type: 'item',
            //     url: '/pages/account/internal'
            // }
        ]
    },
    {
        id: 'catalogue',
        title: 'Catalogue',
        translate: 'NAV.CATALOGUES.TITLE',
        type: 'collapsable',
        icon: 'custom-icons8-open-box',
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
                url: '/pages/catalogues/list'
            }
        ]
    },
    {
        id: 'attendance',
        title: 'Attendance',
        translate: 'NAV.ATTENDANCES.TITLE',
        type: 'item',
        icon: 'event_available',
        url: '/pages/attendances'
    },
    {
        id: 'finance',
        title: 'Finance',
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
            // {
            //     id: 'banks',
            //     title: 'Set Bank',
            //     translate: 'NAV.SET_BANK.TITLE',
            //     type: 'item',
            //     url: '/pages/finances/banks'
            // },
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
        id: 'orderManagement',
        title: 'OMS',
        translate: 'NAV.ORDER_MANAGEMENTS.TITLE',
        type: 'item',
        icon: 'shopping_cart',
        url: '/pages/orders'
    },
    {
        id: 'inventory',
        title: 'Inventory',
        translate: 'NAV.INVENTORIES.TITLE',
        type: 'collapsable',
        icon: 'layers',
        children: [
            {
                id: 'supp',
                title: 'Supplier Inventory',
                translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
                type: 'item',
                url: '/pages/supplier-inventories'
            },
            {
                id: 'instore',
                title: 'In-Store Inventory',
                translate: 'NAV.IN_STORE_INVENTORIES.TITLE',
                type: 'item',
                url: '/pages/in-store-inventories',
                exactMatch: false
            }
        ]
    },
    {
        id: 'sales-force',
        title: 'Sales Rep Management',
        //    translate: 'NAV.INVENTORIES.TITLE',
        type: 'collapsable',
        icon: 'layerassessments',
        children: [
            {
                id: 'sales-rep',
                title: 'Sales Rep',
                //    translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
                type: 'item',
                url: '/pages/sales-force'
            }
        ]
    }
];
