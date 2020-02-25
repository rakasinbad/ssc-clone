import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './main/pages/core/auth/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'pages',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('./main/pages/core/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'profile',
        loadChildren: () =>
            import('./main/pages/core/profile/profile.module').then(m => m.ProfileModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SUPER_SUPPLIER_ADMIN', 'SUPPLIER_ADMIN']
            },
            redirectTo: {
                navigationCommands: ['/pages/errors/403'],
                navigationExtras: {
                    replaceUrl: true,
                    skipLocationChange: true
                }
            }
        }
    },
    {
        path: 'pages',
        children: [
            // {
            //     path: '',
            //     redirectTo: 'dashboard',
            //     pathMatch: 'full'
            // },
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./main/pages/dashboard/dashboard.module').then(m => m.DashboardModule),
                canLoad: [AuthGuard]
            },
            {
                path: 'account',
                loadChildren: () =>
                    import('./main/pages/accounts/accounts.module').then(m => m.AccountsModule),
                canLoad: [AuthGuard, NgxPermissionsGuard],
                data: {
                    permissions: {
                        only: [
                            'SUPER_SUPPLIER_ADMIN',
                            'FINANCE',
                            'HEAD_OF_SALES',
                            'BOS',
                            'COUNTRY_MANAGER',
                            'SUPPLIER_ADMIN'
                        ],
                        redirectTo: {
                            navigationCommands: ['/pages/errors/403'],
                            navigationExtras: {
                                replaceUrl: true,
                                skipLocationChange: true
                            }
                        }
                    }
                }
            },
            {
                path: 'attendances',
                loadChildren: () =>
                    import('./main/pages/attendances/attendances.module').then(
                        m => m.AttendancesModule
                    ),
                canLoad: [AuthGuard, NgxPermissionsGuard],
                data: {
                    permissions: {
                        only: ['SUPER_SUPPLIER_ADMIN', 'BOS', 'COUNTRY_MANAGER', 'SUPPLIER_ADMIN'],
                        redirectTo: {
                            navigationCommands: ['/pages/errors/403'],
                            navigationExtras: {
                                replaceUrl: true,
                                skipLocationChange: true
                            }
                        }
                    }
                }
            },
            {
                path: 'finances',
                // children: [
                //     {
                //         path: '',
                //         redirectTo: 'credit-limit-balance',
                //         pathMatch: 'full'
                //     },
                //     {
                //         path: 'credit-limit-balance',
                //         loadChildren: () =>
                //             import(
                //                 './main/pages/finances/credit-limit-balance/credit-limit-balance.module'
                //             ).then(m => m.CreditLimitBalanceModule),
                //         canLoad: [AuthGuard]
                //     }
                // ]
                loadChildren: () =>
                    import('./main/pages/finances/finances.module').then(m => m.FinancesModule),
                canLoad: [AuthGuard, NgxPermissionsGuard],
                data: {
                    permissions: {
                        only: [
                            'SUPER_SUPPLIER_ADMIN',
                            'FINANCE',
                            'HEAD_OF_SALES',
                            'BOS',
                            'COUNTRY_MANAGER'
                        ],
                        redirectTo: {
                            navigationCommands: ['/pages/errors/403'],
                            navigationExtras: {
                                replaceUrl: true,
                                skipLocationChange: true
                            }
                        }
                    }
                }
            },
            {
                path: 'orders',
                loadChildren: () =>
                    import('./main/pages/orders/orders.module').then(m => m.OrdersModule),
                canLoad: [AuthGuard, NgxPermissionsGuard],
                data: {
                    permissions: {
                        only: [
                            'SUPER_SUPPLIER_ADMIN',
                            'FINANCE',
                            'HEAD_OF_SALES',
                            'BOS',
                            'COUNTRY_MANAGER',
                            'SUPPLIER_ADMIN'
                        ],
                        redirectTo: {
                            navigationCommands: ['/pages/errors/403'],
                            navigationExtras: {
                                replaceUrl: true,
                                skipLocationChange: true
                            }
                        }
                    }
                }
            },
            {
                path: 'catalogues',
                loadChildren: () =>
                    import('./main/pages/catalogues/catalogues.module').then(
                        m => m.CataloguesModule
                    ),
                canLoad: [AuthGuard, NgxPermissionsGuard],
                data: {
                    permissions: {
                        only: [
                            'SUPER_SUPPLIER_ADMIN',
                            'HEAD_OF_SALES',
                            'BOS',
                            'COUNTRY_MANAGER',
                            'SUPPLIER_ADMIN'
                        ],
                        redirectTo: {
                            navigationCommands: ['/pages/errors/403'],
                            navigationExtras: {
                                replaceUrl: true,
                                skipLocationChange: true
                            }
                        }
                    }
                }
            },
            {
                path: 'in-store-inventories',
                loadChildren: () =>
                    import('./main/pages/in-store-inventories/in-store-inventories.module').then(
                        m => m.InStoreInventoriesModule
                    ),
                canLoad: [AuthGuard, NgxPermissionsGuard],
                data: {
                    permissions: {
                        only: [
                            'SUPER_SUPPLIER_ADMIN',
                            'HEAD_OF_SALES',
                            'BOS',
                            'COUNTRY_MANAGER',
                            'SUPPLIER_ADMIN'
                        ],
                        redirectTo: {
                            navigationCommands: ['/pages/errors/403'],
                            navigationExtras: {
                                replaceUrl: true,
                                skipLocationChange: true
                            }
                        }
                    }
                }
            },
            {
                path: 'sales-force',
                loadChildren: () =>
                    import('./main/pages/sales-forces/sales-forces.module').then(
                        m => m.SalesForcesModule
                    ),
                canLoad: [AuthGuard, NgxPermissionsGuard],
                data: {
                    permissions: {
                        only: [
                            'SUPER_SUPPLIER_ADMIN',
                            'HEAD_OF_SALES',
                            'BOS',
                            'COUNTRY_MANAGER',
                            'SUPPLIER_ADMIN'
                        ]
                    },
                    redirectTo: {
                        navigationCommands: ['/pages/errors/403'],
                        navigationExtras: {
                            replaceUrl: true,
                            skipLocationChange: true
                        }
                    }
                }
            },
            {
                path: 'supplier-inventories',
                loadChildren: () =>
                    import('./main/pages/supplier-inventories/supplier-inventories.module').then(
                        m => m.SupplierInventoriesModule
                    ),
                canLoad: [AuthGuard, NgxPermissionsGuard],
                data: {
                    permissions: {
                        only: [
                            'SUPER_SUPPLIER_ADMIN',
                            'HEAD_OF_SALES',
                            'BOS',
                            'COUNTRY_MANAGER',
                            'SUPPLIER_ADMIN'
                        ]
                    },
                    redirectTo: {
                        navigationCommands: ['/pages/errors/403'],
                        navigationExtras: {
                            replaceUrl: true,
                            skipLocationChange: true
                        }
                    }
                }
            },
            {
                path: 'settings',
                loadChildren: () =>
                    import('./main/pages/settings/settings.module').then(m => m.SettingsModule),
                canLoad: [AuthGuard, NgxPermissionsGuard],
                data: {
                    permissions: {
                        only: ['SUPER_SUPPLIER_ADMIN', 'SUPPLIER_ADMIN']
                    },
                    redirectTo: {
                        navigationCommands: ['/pages/errors/403'],
                        navigationExtras: {
                            replaceUrl: true,
                            skipLocationChange: true
                        }
                    }
                }
            },
            {
                path: 'errors',
                loadChildren: () =>
                    import('./main/pages/core/errors/errors.module').then(m => m.ErrorsModule)
            },
            {
                path: 'logistics',
                loadChildren: () =>
                    import('./main/pages/logistics/logistics.module').then(m => m.LogisticsModule)
            },
            {
                path: '',
                redirectTo: 'account',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        loadChildren: () =>
            import('./main/pages/core/errors/errors.module').then(m => m.ErrorsModule)
    }
];

/**
 *
 *
 * @export
 * @class AppRoutingModule
 */
@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
