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
                        // this._navigationSetup(item.id);

                        const totalChild = item.children.length;
                        const totalChildHidden = item.children.filter(i => i.classes === 'navigation-display-hidden')
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
}
