import { FuseNavigation } from '@fuse/types';

export interface IFuseNavigation extends FuseNavigation{
    privilages?: string
    children?: IFuseNavigation[];
}

export const navigation: IFuseNavigation[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        translate: 'NAV.DASHBOARD.TITLE',
        type: 'item',
        icon: 'custom-sinbad-dashboard-logo',
        url: '/pages/dashboard'
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
                privilages: 'ACCOUNT.STORE.READ',
                url: '/pages/account/stores',
            },
            {
                id: 'storeSetting',
                title: 'Store Setting',
                translate: 'NAV.ACCOUNTS_STORE_SETTING.TITLE',
                type: 'item',
                privilages: 'ACCOUNT.STORE.READ',
                url: '/pages/account/store-setting',
            },
            {
                id: 'storeSegmentation',
                title: 'Store Segmentation',
                //    translate: 'NAV.ACCOUNTS_STORE_SETTING.TITLE',
                type: 'item',
                privilages: 'ACCOUNT.STORE.READ',
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
            /* {
                id: 'addProduct',
                title: 'Add Product',
                translate: 'NAV.ADD_PRODUCT.TITLE',
                type: 'item',
                url: '/pages/catalogues/add',
            }, */
            {
                id: 'manageProduct',
                title: 'Manage Product',
                translate: 'NAV.MANAGE_PRODUCT.TITLE',
                type: 'item',
                privilages: 'CATALOGUE.READ',
                url: '/pages/catalogues/list',
            },
            {
                id: 'segmentation',
                title: 'Catalogue Segmentation',
                type: 'item',
                privilages: 'CATALOGUE.READ',
                url: '/pages/catalogue-segmentations',
            },
        ],
    },
    {
        id: 'attendance',
        title: 'Attendance',
        translate: 'NAV.ATTENDANCES.TITLE',
        type: 'item',
        icon: 'custom-sinbad-attendance-logo',
        privilages: 'ATTENDANCE.READ',
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
                privilages: 'FINANCE.CLB.SL.READ',
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
                privilages: 'FINANCE.PS.READ',
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
        privilages: 'OMS.READ',
        url: '/pages/orders',
    },
    {
        id: 'returnManagement',
        title: 'Return',
        translate: 'NAV.RETURN.TITLE',
        type: 'item',
        icon: 'custom-sinbad-oms-logo',
        privilages: 'OMS.READ',
        url: '/pages/returns',
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
                privilages: 'INVENTORY.ISI.READ',
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
                id: 'sales-team',
                title: 'Sales Team',
                //    translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
                type: 'item',
                url: '/pages/sales-force/sales-team',
            },
            // {
            //     id: 'sales-rep',
            //     title: 'Sales Rep',
            //     //    translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
            //     type: 'item',
            //     privilages: 'SRM.SR.READ',
            //     url: '/pages/sales-force/sales-rep',
            // },
            {
                id: 'sales-repsv2',
                title: 'Sales Rep',
                type: 'item',
                privilages: 'SRM.SR.READ',
                url: '/pages/sales-force/sales-repsv2',
            },
            // {
            //     id: 'portfolio',
            //     title: 'Portfolio of Store',
            //     //    translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
            //     type: 'item',
            //     privilages: 'SRM.PFO.READ',
            //     url: '/pages/sales-force/portfolio',
            // },
            {
                id: 'portfoliov2',
                title: 'Portfolio of Store',
                //    translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
                type: 'item',
                privilages: 'SRM.PFO.READ',
                url: '/pages/sales-force/portfoliosv2',
            },
            {
                id: 'sr-target',
                title: 'SR Target',
                type: 'item',
                url: '/pages/sales-force/sr-target',
            },
            {
                id: 'pjp',
                title: 'Permanent Journey Plan',
                type: 'item',
                url: '/pages/sales-force/pjp',
            },
            // {
            //     id: 'association',
            //     title: 'SR Assignment',
            //     //    translate: 'NAV.SUPPLIER_INVENTORIES.TITLE',
            //     type: 'item',
            //     privilages: 'SRM.ASC.READ',
            //     url: '/pages/sales-force/associations',
            // },
            // {
            //     id: 'journey-plan',
            //     title: 'Journey Plan',
            //     type: 'item',
            //     privilages: 'SRM.JP.READ',
            //     url: '/pages/sales-force/journey-plans',
            // },
            {
                id: 'journey-planv2',
                title: 'Journey Plan',
                type: 'item',
                privilages: 'SRM.JP.READ',
                url: '/pages/sales-force/journey-planssv2',
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
                privilages: 'WH.L.READ',
                url: '/pages/logistics/warehouses',
            },
            {
                id: 'wh-coverage',
                title: 'Warehouse Coverage',
                type: 'item',
                privilages: 'WH.C.READ',
                url: '/pages/logistics/warehouse-coverages',
            },
            {
                id: 'wh-sku-assignment',
                title: 'SKU Assignment',
                type: 'item',
                privilages: 'WH.SKU.READ',
                url: '/pages/logistics/sku-assignments',
            },
            {
                id: 'wh-stock-management',
                title: 'Stock Management',
                type: 'item',
                privilages: 'WH.SM.READ',
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
                privilages: 'PRM.FC.READ',
                url: '/pages/promos/flexi-combo',
            },
            {
                id: 'cross-selling-promo',
                title: 'Cross Selling Promo',
                type: 'item',
                privilages: 'PRM.CSP.READ',
                url: '/pages/promos/cross-selling-promo',
            },
            {
                id: 'period-target-promo',
                title: 'Period Target Promo',
                type: 'item',
                // privilages: 'PRM.CSP.READ',
                url: '/pages/promos/period-target-promo',
            },
            {
                id: 'voucher',
                title: 'Supplier Voucher',
                type: 'item',
                privilages: 'PRM.SV.READ',
                url: '/pages/promos/voucher',
            },
            {
                id: 'promo-hierarchy',
                title: 'Promo Hierarchy',
                type: 'item',
                privilages: 'PRM.PH.READ',
                url: '/pages/promos/promo-hierarchy',
            },
        ],
    },
    {
        id: 'survey',
        title: 'Sinbad Survey',
        type: 'collapsable',
        icon: 'custom-sinbad-survey-logo',
        children: [
            {
                id: 'survey-manage',
                title: 'Manage',
                type: 'item',
                privilages: 'SS.READ',
                url: '/pages/survey/manage',
            },
            // TODO: temporary disable
            // {
            //     id: 'survey-response',
            //     title: 'Response',
            //     type: 'item',
            //     url: '/pages/survey/response',
            // },
        ],
    },
    {
        id: 'quest',
        title: 'Sinbad Quest',
        type: 'item',
        icon: 'custom-sinbad-quest-logo',
        url: '/pages/quest',
    },
    {
        id: 'skp',
        title: 'SKP',
        // translate: 'NAV.SKP.TITLE',
        type: 'item',
        icon: 'custom-sinbad-skp-logo',
        privilages: 'SKP.READ',
        url: '/pages/skp',
    },
];
