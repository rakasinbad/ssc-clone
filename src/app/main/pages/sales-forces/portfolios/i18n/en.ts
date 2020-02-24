import { globalEnLang } from 'app/lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        IMPORT_PRICE: 'Import Price',
        UPDATE_PRICE_TEMPLATE: 'Update Price',
        IMPORT_STOCK: 'Import Stock',
        UPDATE_STOCK_TEMPLATE: 'Update Stock',
        BREADCRUMBS: {
            ...globalEnLang.BREADCRUMBS,
            PORTFOLIO: 'Portfolio',
            PORTFOLIO_ADD: 'Add Portfolio',
            PORTFOLIO_EDIT: 'Edit Portfolio',
            PORTFOLIO_DETAIL: 'Detail Portfolio'
        }
    }
};
