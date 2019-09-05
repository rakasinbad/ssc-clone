import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'applications',
        title: 'Applications',
        translate: 'NAV.APPLICATIONS',
        type: 'group',
        children: [
            {
                id: 'dashboard',
                title: 'Dashboard',
                translate: 'NAV.DASHBOARD.TITLE',
                type: 'item',
                icon: 'dashboard',
                url: '/dashboard'
                // badge: {
                //     title: '25',
                //     translate: 'NAV.DASHBOARD.BADGE',
                //     bg: '#F44336',
                //     fg: '#FFFFFF'
                // }
            },
            {
                id: 'login',
                title: 'Login',
                type: 'item',
                icon: 'input',
                url: '/auth/login'
            }
        ]
    }
];
