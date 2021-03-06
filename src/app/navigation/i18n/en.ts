import { globalEnLang } from '../../lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        ERROR: {
            ...globalEnLang.ERROR,
            MISMATCH_EXTENSION:
                '{{ fieldName }} field only accepts some file extensions: [{{ extensions }}]'
        },
        NAV: {
            ADD_PRODUCT: {
                TITLE: 'Add Product'
            },
            APPLICATIONS: 'Applications',
            ARCHIVED: {
                TITLE: 'Archived'
            },
            ACCOUNTS: {
                TITLE: 'Store'
            },
            ACCOUNTS_STORE: {
                TITLE: 'Store List'
            },
            ACCOUNTS_STORE_SETTING: {
                TITLE: 'Store Setting'
            },
            ACCOUNTS_INTERNAL: {
                TITLE: 'Internal'
            },
            ATTENDANCES: {
                TITLE: 'Attendances'
            },
            CATALOGUES: {
                TITLE: 'Catalogue'
            },
            CREDIT_LIMIT_BALANCE: {
                TITLE: 'Credit Limit/Balance'
            },
            DASHBOARD: {
                TITLE: 'Dashboard',
                BADGE: '25'
            },
            FINANCES: {
                TITLE: 'Finances'
            },
            IN_STORE_INVENTORIES: {
                TITLE: 'In-Store Inventory'
            },
            INVENTORIES: {
                TITLE: 'Inventory'
            },
            MANAGE_PRODUCT: {
                TITLE: 'Manage Product'
            },
            ORDER_MANAGEMENTS: {
                TITLE: 'OMS'
            },
            RETURN: {
                TITLE: 'Return'
            },
            PAYMENT_STATUS: {
                TITLE: 'Payment Status'
            },
            COLLECTION_REQUEST: {
                TITLE: 'Collection Request'
            },
            SET_BANK: {
                TITLE: 'Set Bank'
            },
            SUPPLIER_INVENTORIES: {
                TITLE: 'Supplier Inventory'
            }
        }
    }
};
