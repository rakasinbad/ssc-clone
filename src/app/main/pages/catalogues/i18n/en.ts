import { globalEnLang } from 'app/lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        ORDER_DOCUMENT: 'Document Order',
        ORDER_LINES: 'Order Lines',
        ORDER_STATUS: 'Order Status',
        IMPORT_PRICE: 'Import Price',
        IMPORT_STOCK: 'Import Stock',
        IMPORT_MSS_TEMPLATE: 'MSS Type Upload',
        UPDATE_PRICE_TEMPLATE: 'Update Price',
        UPDATE_STOCK_TEMPLATE: 'Update Stock',
        BULK_CREATE: 'Create SKU',
        BULK_CREATE_GUIDE: 'Guide',
        BULK_CREATE_TEMPLATE: 'Import Example',
        UPDATE_MSS_TYPE: 'MSS Type Upload',
        FORM: {
            ...globalEnLang.FORM,
            MAIN_PRODUCT_PHOTO: 'Main Product Photo',
            PRODUCT_PHOTO_1: 'Product Photo #1',
            PRODUCT_PHOTO_2: 'Product Photo #2',
            PRODUCT_PHOTO_3: 'Product Photo #3',
            PRODUCT_PHOTO_4: 'Product Photo #4',
            PRODUCT_PHOTO_5: 'Product Photo #5',
        },
        STATUS: {
            CATALOGUE: {
                ACTIVE: {
                    TITLE: 'Active',
                },
                ALL: {
                    TITLE: 'All',
                },
                ALL_PARAM: {
                    TITLE: 'All ({{ allCount }})',
                },
                BANNED: {
                    TITLE: 'Banned',
                },
                BANNED_PARAM: {
                    TITLE: 'Banned ({{ bannedCount }})',
                },
                BLOCKED: {
                    TITLE: 'Blocked',
                },
                BLOCKED_PARAM: {
                    TITLE: 'Blocked ({{ blockedCount }})',
                },
                BONUS: {
                    TITLE: 'Bonus',
                },
                LIVE: {
                    TITLE: 'Live',
                },
                LIVE_PARAM: {
                    TITLE: 'Live ({{ liveCount }})',
                },
                EMPTY: {
                    TITLE: 'Empty',
                },
                EMPTY_PARAM: {
                    TITLE: 'Empty ({{ emptyCount }})',
                },
                REGULAR: {
                    TITLE: 'Regular',
                },
                INACTIVE: {
                    TITLE: 'Inactive',
                },
            },
        },
    },
};
