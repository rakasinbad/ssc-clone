import { Injectable } from '@angular/core';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseNavigation } from '@fuse/types';
import { NgxRolesObject, NgxRolesService } from 'ngx-permissions';
import { NavigationRulesService } from 'app/shared/helpers';
@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    constructor(
        private ngxRoles: NgxRolesService,
        private _fuseNavigationService: FuseNavigationService,
        private _navigationRules : NavigationRulesService,
    ) {
    }

    initNavigation(): void {
        const navs = this._fuseNavigationService.getCurrentNavigation() as Array<FuseNavigation>;
        const roles = this.ngxRoles.getRoles();

        // this._initNavigationCheck(navs, roles);
        this._initNavigationCheck(navs, roles);
    }

    private _initNavigationCheck(nav: Array<FuseNavigation>, roles?: NgxRolesObject): void {
        if (nav && nav.length > 0) {
            for (const [idx, item] of nav.entries()) {
                if (item.type === 'group') {
                    // console.log('Group', item);
                }

                if (item.type === 'item') {
                    this._navigationSetup(item.id);

                    // console.log('Item', item);
                }

                if (item.type === 'collapsable') {
                    if (item.children && item.children.length > 0) {
                        this._initNavigationCheck(item.children, roles);
                        this._navigationSetup(item.id);

                        // console.log('Collapsable', totalChild, totalChildHidden, item);
                    } else {
                        this._navigationSetup(item.id);
                    }
                }
            }
        }
    }

    private _navigationSetup(id: string): void {
        if (!id) {
            return;
        }

        this._fuseNavigationService.updateNavigationItem(id, {
            classes: 
                !this._navigationRules.validateNavigationOnRole(id) ? 'navigation-display-hidden' : ''
        });

    }

    // private _initNavigationCheck(nav: Array<FuseNavigation>, roles?: NgxRolesObject): void {
    //     if (nav && nav.length > 0) {
    //         for (const [idx, item] of nav.entries()) {
    //             if (item.type === 'group') {
    //                 console.log('Group', item);
    //             }

    //             if (item.type === 'item') {
    //                 this._navigationRules(item.id);

    //                 // console.log('Item', item);
    //             }

    //             if (item.type === 'collapsable') {
    //                 if (item.children && item.children.length > 0) {
    //                     this._initNavigationCheck(item.children, roles);

    //                     const totalChild = item.children.length;
    //                     const totalChildHidden = item.children.filter(i => i.hidden === true)
    //                         .length;

    //                     if (totalChild === totalChildHidden) {
    //                         this._navigationRules(item.id);
    //                     } else {
    //                         this._fuseNavigationService.updateNavigationItem(item.id, {
    //                             hidden: false
    //                         });
    //                     }

    //                     // console.log('Collapsable', totalChild, totalChildHidden, item);
    //                 } else {
    //                     this._navigationRules(item.id);
    //                 }
    //             }
    //         }
    //     }
    // }

    // private _navigationRules(id: string): void {
    //     if (!id) {
    //         return;
    //     }

    //     switch (id) {
    //         // Catalogue
    //         case 'addProduct':
    //         case 'manageProduct':
    //             this._fuseNavigationService.updateNavigationItem(id, {
    //                 hidden:
    //                     !this.ngxRoles.getRole('SUPER_SUPPLIER_ADMIN') &&
    //                     !this.ngxRoles.getRole('HEAD_OF_SALES') &&
    //                     !this.ngxRoles.getRole('BOS') &&
    //                     !this.ngxRoles.getRole('COUNTRY_MANAGER') &&
    //                     !this.ngxRoles.getRole('SUPPLIER_ADMIN')
    //             });
    //             break;

    //         // Attendance
    //         case 'attendance':
    //             this._fuseNavigationService.updateNavigationItem(id, {
    //                 hidden:
    //                     !this.ngxRoles.getRole('SUPER_SUPPLIER_ADMIN') &&
    //                     !this.ngxRoles.getRole('BOS') &&
    //                     !this.ngxRoles.getRole('COUNTRY_MANAGER') &&
    //                     !this.ngxRoles.getRole('SUPPLIER_ADMIN')
    //             });
    //             break;

    //         // Finance
    //         case 'creditLimitBalance':
    //         case 'paymentStatus':
    //             this._fuseNavigationService.updateNavigationItem(id, {
    //                 hidden:
    //                     !this.ngxRoles.getRole('SUPER_SUPPLIER_ADMIN') &&
    //                     !this.ngxRoles.getRole('FINANCE') &&
    //                     !this.ngxRoles.getRole('HEAD_OF_SALES') &&
    //                     !this.ngxRoles.getRole('BOS') &&
    //                     !this.ngxRoles.getRole('COUNTRY_MANAGER')
    //             });
    //             break;

    //         // Account Store
    //         case 'accountsStore':
    //         // OMS
    //         case 'orderManagement':
    //             this._fuseNavigationService.updateNavigationItem(id, {
    //                 hidden:
    //                     !this.ngxRoles.getRole('SUPER_SUPPLIER_ADMIN') &&
    //                     !this.ngxRoles.getRole('FINANCE') &&
    //                     !this.ngxRoles.getRole('HEAD_OF_SALES') &&
    //                     !this.ngxRoles.getRole('BOS') &&
    //                     !this.ngxRoles.getRole('COUNTRY_MANAGER') &&
    //                     !this.ngxRoles.getRole('SUPPLIER_ADMIN') && 
    //                     !this.ngxRoles.getRole('SALES_ADMIN_CABANG')
    //             });
    //             break;

    //         // Inventories:
    //         case 'supp':
    //         case 'instore':
    //             this._fuseNavigationService.updateNavigationItem(id, {
    //                 hidden:
    //                     !this.ngxRoles.getRole('SUPER_SUPPLIER_ADMIN') &&
    //                     !this.ngxRoles.getRole('HEAD_OF_SALES') &&
    //                     !this.ngxRoles.getRole('BOS') &&
    //                     !this.ngxRoles.getRole('COUNTRY_MANAGER') &&
    //                     !this.ngxRoles.getRole('SUPPLIER_ADMIN')
    //             });
    //             break;

    //         // Sales Foce
    //         case 'sales-rep':
    //         case 'portfolio':
    //         case 'association':
    //         case 'journey-plan':
    //             this._fuseNavigationService.updateNavigationItem(id, {
    //                 hidden:
    //                     !this.ngxRoles.getRole('SUPER_SUPPLIER_ADMIN') &&
    //                     !this.ngxRoles.getRole('HEAD_OF_SALES') &&
    //                     !this.ngxRoles.getRole('BOS') &&
    //                     !this.ngxRoles.getRole('COUNTRY_MANAGER') &&
    //                     !this.ngxRoles.getRole('SUPPLIER_ADMIN')
    //             });
    //             break;

    //         default:
    //             this._fuseNavigationService.updateNavigationItem(id, {
    //                 hidden: !this.ngxRoles.getRole('SUPER_SUPPLIER_ADMIN')
    //             });
    //             break;
    //     }
    // }
}
