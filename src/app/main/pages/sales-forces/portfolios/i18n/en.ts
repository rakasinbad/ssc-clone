import { globalEnLang } from 'app/lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        CREATE_PORTFOLIOS_TEMPLATE: 'Create Portfolios',
        UPDATE_PORTFOLIOS_TEMPLATE: 'Update Portfolios',
        DELETE_PORTFOLIOS_TEMPLATE: 'Delete Portfolios',
        IMPORT_CREATE_PORTFOLIOS: 'Import Create Portfolios',
        IMPORT_UPDATE_PORTFOLIOS: 'Import Update Portfolios',
        IMPORT_DELETE_PORTFOLIOS: 'Import Delete Portfolios',
        BREADCRUMBS: {
            ...globalEnLang.BREADCRUMBS,
            PORTFOLIO: 'Portfolio',
            PORTFOLIO_ADD: 'Add Portfolio',
            PORTFOLIO_EDIT: 'Edit Portfolio',
            PORTFOLIO_DETAIL: 'Detail Portfolio'
        }
    }
};
