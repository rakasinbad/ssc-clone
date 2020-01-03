import { globalEnLang } from 'app/lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        BREADCRUMBS: {
            ...globalEnLang.BREADCRUMBS,
            PORTFOLIO: 'Portfolio',
            PORTFOLIO_ADD: 'Add Portfolio',
            PORTFOLIO_EDIT: 'Edit Portfolio',
            PORTFOLIO_DETAIL: 'Detail Portfolio'
        }
    }
};
