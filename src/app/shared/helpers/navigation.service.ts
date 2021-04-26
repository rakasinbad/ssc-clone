import { Injectable } from '@angular/core';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseNavigation } from '@fuse/types';
import { NgxPermissionsService, NgxRolesObject, NgxRolesService } from 'ngx-permissions';
import { HelperService, NavigationRulesService } from 'app/shared/helpers';
import { IFuseNavigation } from 'app/navigation/navigation';
@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    constructor(
        // private ngxRoles: NgxRolesService,
        private ngxPermissions: NgxPermissionsService,
        private _fuseNavigationService: FuseNavigationService,
        private _navigationRules : NavigationRulesService,
    ) {
    }

    initNavigation(): void {
        const navs = this._fuseNavigationService.getCurrentNavigation() as Array<FuseNavigation>;
        // const roles = this.ngxRoles.getRoles();

        // this._initNavigationCheck(navs, roles);

        this._initNavigationCheck(navs);
    }

    // private _initNavigationCheck(nav: Array<FuseNavigation>, roles?: NgxRolesObject): void {
    //     if (nav && nav.length > 0) {
    //         for (const [idx, item] of nav.entries()) {
    //             if (item.type === 'group') {
    //                 // console.log('Group', item);
    //             }

    //             if (item.type === 'item') {
    //                 this._navigationSetup(item);

    //                 // console.log('Item', item);
    //             }

    //             if (item.type === 'collapsable') {
    //                 if (item.children && item.children.length > 0) {
    //                     this._initNavigationCheck(item.children, roles);
    //                     // this._navigationSetup(item);

    //                     const totalChild = item.children.length;
    //                     const totalChildHidden = item.children.filter(i => i.classes === 'navigation-display-hidden')
    //                         .length;

    //                     if (totalChild === totalChildHidden) {
    //                         this._fuseNavigationService.updateNavigationItem(item.id, {
    //                             classes: 'navigation-display-hidden'
    //                         });
    //                     } else {
    //                         this._fuseNavigationService.updateNavigationItem(item.id, {
    //                             classes: ''
    //                         });
    //                     }

    //                     // console.log('Collapsable', totalChild, totalChildHidden, item);
    //                 } else {
    //                     this._navigationSetup(item);
    //                 }
    //             }
    //         }
    //     }
    // }

    private async _initNavigationCheck(nav: Array<FuseNavigation>){
        if (nav && nav.length > 0) {
            for (const [idx, item] of nav.entries()) {
                if (item.type === 'group') {
                    // console.log('Group', item);
                }

                if (item.type === 'item') {
                    await this._navigationSetup(item);

                    // console.log('Item', item);
                }

                if (item.type === 'collapsable') {
                    if (item.children && item.children.length > 0) {
                        await this._initNavigationCheck(item.children);
                        // this._navigationSetup(item);

                        const totalChild = item.children.length;
                        const totalChildHidden = item.children.filter(i => i.classes === "navigation-display-hidden")
                            .length;

                        if (totalChild === totalChildHidden) {
                            this._fuseNavigationService.updateNavigationItem(item.id, {
                                classes: 'navigation-display-hidden'
                            });
                        } else {
                            this._fuseNavigationService.updateNavigationItem(item.id, {
                                classes: ''
                            });
                        }

                        // console.log('Collapsable', totalChild, totalChildHidden, item);
                    } else {
                        this._navigationSetup(item);
                    }
                }
            }
        }
    }

    private async _navigationSetup(item: IFuseNavigation) {
        if (!item.id) {
            return;
        }

        await this.ngxPermissions.hasPermission(item.privilages).then((hasAccess) => {
            this._fuseNavigationService.updateNavigationItem(item.id, {
                classes: 
                    !hasAccess ? 'navigation-display-hidden' : ''
            });
        });
    }
}
