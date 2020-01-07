import { globalEnLang } from 'app/lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        BREADCRUMBS: {
            ...globalEnLang.BREADCRUMBS,
            ASSOCIATION: 'Association',
            ASSOCIATION_ADD: 'Add Association',
            ASSOCIATION_EDIT: 'Edit Association',
            ASSOCIATION_DETAIL: 'Detail Association'
        }
    }
};
