import { globalIdLang } from '../../lang/i18n/id';

export const locale = {
    lang: 'id',
    data: {
        ...globalIdLang,
        ERROR: {
            ...globalIdLang.ERROR,
            MISMATCH_EXTENSION:
                '{{ fieldName }} field only accepts some file extensions: [{{ extensions }}]'
        },
        NAV: {
            ADD_PRODUCT: {
                TITLE: 'Add Product'
            },
            APPLICATIONS: 'Aplikasi',
            ARCHIVED: {
                TITLE: 'Archived'
            },
            ACCOUNTS: {
                TITLE: 'Store'
            },
            ACCOUNTS_STORE: {
                TITLE: 'Store List'
            },
            ACCOUNTS_INTERNAL: {
                TITLE: 'Internal'
            },
            ATTENDANCES: {
                TITLE: 'Attendance'
            },
            CATALOGUES: {
                TITLE: 'Catalogue'
            },
            CREDIT_LIMIT_BALANCE: {
                TITLE: 'Credit Limit/Balance'
            },
            DASHBOARD: {
                TITLE: 'Dashboard',
                BADGE: '15'
            },
            FINANCES: {
                TITLE: 'Finance'
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
            PAYMENT_STATUS: {
                TITLE: 'Payment Status'
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
