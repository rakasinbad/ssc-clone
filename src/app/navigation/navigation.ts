import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        translate: 'NAV.DASHBOARD.TITLE',
        type: 'item',
        icon: 'custom-sinbad-dashboard-logo',
        url: '/pages/dashboard',
    },
    {
        id: 'account',
        title: 'Store',
        translate: 'NAV.ACCOUNTS.TITLE',
        type: 'collapsable',
        icon: 'custom-sinbad-store-logo',
        children: [
            {
                id: 'accountsStore',
                title: 'Store List',
                translate: 'NAV.ACCOUNTS_STORE.TITLE',
                type: 'item',
                url: '/pages/account/stores',
            },
            {
                id: 'storeSetting',
                title: 'Store Setting',
                translate: 'NAV.ACCOUNTS_STORE_SETTING.TITLE',
                type: 'item',
                url: '/pages/account/store-setting',
            },
            {
                id: 'storeSegmentation',
                title: 'Store Segmentation',
                //    translate: 'NAV.ACCOUNTS_STORE_SETTING.TITLE',
                type: 'item',
                url: '/pages/account/store-segmentation',
            },
            // {
            //     id: 'accountsInternal',
            //     title: 'Internal',
            //     translate: 'NAV.ACCOUNTS_INTERNAL.TITLE',
            //     type: 'item',
            //     url: '/pages/account/internal'
            // }
        ],
    },
    {
        id: 'catalogue',
        title: 'Catalogue',
        translate: 'NAV.CATALOGUES.TITLE',
        type: 'collapsable',
        icon: 'custom-sinbad-catalogue-logo',
        children: [
            {
                id: 'addProduct',
                title: 'Add Product',
                translate: 'NAV.ADD_PRODUCT.TITLE',
                type: 'item',
                url: '/pages/catalogues/add',
            },
            {
                id: 'manageProduct',
                title: 'Manage Product',
                translate: 'NAV.MANAGE_PRODUCT.TITLE',
                type: 'item',
                url: '/pages/catalogues/list',
            },
        ],
    },
    {
        id: 'attendance',
        title: 'Attendance',
        translate: 'NAV.ATTENDANCES.TITLE',
        type: 'item',
        icon: 'custom-sinbad-attendance-logo',
        url: '/pages/attendances',
    },
    {
        id: 'finance',
        title: 'Finance',
        translate: 'NAV.FINANCES.TITLE',
        type: 'collapsable',
        icon: 'custom-sinbad-finance-logo',
        children: [
            {
                id: 'creditLimitBalance',
                title: 'Credit Limit/Balance',
                translate: 'NAV.CREDIT_LIMIT_BALANCE.TITLE',
                type: 'item',
                url: '/pages/finances/credit-limit-balance',
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
                url: '/pages/finances/payment-status',
            },
        ],
    },
    {
        id: 'orderManagement',
        title: 'OMS',
        translate: 'NAV.ORDER_MANAGEMENTS.TITLE',
        type: 'item',
        icon: 'custom-sinbad-oms-logo',
        url: '/pages/orders',
    },
    {
        id: 'inventory',
        title: 'Inventory',
        translate: 'NAV.INVENTORIES.TITLE',
        type: 'collapsable',
        icon: 'custom-sinbad-inventory-logo',
        children: [
            // {
            //     id: 'supp',
            //     title: 'Supplier Inventory',
            //     translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
            //     type: 'item',
            //     url: '/pages/supplier-inventories'
            // },
            {
                id: 'instore',
                title: 'In-Store Inventory',
                translate: 'NAV.IN_STORE_INVENTORIES.TITLE',
                type: 'item',
                url: '/pages/in-store-inventories',
                exactMatch: false,
            },
        ],
    },
    {
        id: 'sales-force',
        title: 'Sales Management',
        //    translate: 'NAV.INVENTORIES.TITLE',
        type: 'collapsable',
        icon: 'custom-sinbad-sales-force-logo',
        children: [
            {
                id: 'sales-rep',
                title: 'Sales Rep',
                //    translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
                type: 'item',
                url: '/pages/sales-force/sales-rep',
            },
            {
                id: 'portfolio',
                title: 'Portfolio of Store',
                //    translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
                type: 'item',
                url: '/pages/sales-force/portfolio',
            },
            {
                id: 'sr-target',
                title: 'SR Target',
                type: 'item',
                url: '/pages/sales-force/sr-target',
            },
            {
                id: 'association',
                title: 'SR Assignment',
                //    translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
                type: 'item',
                url: '/pages/sales-force/associations',
            },
            {
                id: 'journey-plan',
                title: 'Journey Plan',
                type: 'item',
                url: '/pages/sales-force/journey-plans',
            },
            {
                id: 'workday-setting',
                title: 'Workday Setting',
                type: 'item',
                url: '/pages/sales-force/workday-setting',
            },
        ],
    },
    {
        id: 'warehouse',
        title: 'Warehouse',
        type: 'collapsable',
        icon: 'custom-sinbad-logistics',
        children: [
            {
                id: 'wh-list',
                title: 'Warehouse List',
                type: 'item',
                url: '/pages/logistics/warehouses',
            },
            {
                id: 'wh-coverage',
                title: 'Warehouse Coverage',
                type: 'item',
                url: '/pages/logistics/warehouse-coverages',
            },
            {
                id: 'wh-sku-assignment',
                title: 'SKU Assignment',
                type: 'item',
                url: '/pages/logistics/sku-assignments',
            },
            {
                id: 'wh-stock-management',
                title: 'Stock Management',
                type: 'item',
                url: '/pages/logistics/stock-managements',
            },
        ],
    },
    {
        id: 'promo',
        title: 'Promo',
        type: 'collapsable',
        icon: 'custom-sinbad-promo-logo',
        children: [
            {
                id: 'flexi-combo',
                title: 'Flexi Combo',
                type: 'item',
                url: '/pages/promos/flexi-combo',
            },
            {
                id: 'period-target-promo',
                title: 'Period Target Promo',
                type: 'item',
                url: '/pages/promos/period-target-promo',
            },
            {
                id: 'voucher',
                title: 'Supplier Voucher',
                type: 'item',
                url: '/pages/promos/voucher',
            },
        ],
    },
];
