import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HelperService, NavigationRulesService } from 'app/shared/helpers';
import { navigation } from 'app/navigation/navigation';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate{
  constructor(
    private router: Router,
    private ngxPermissions: NgxPermissionsService,
) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      for (const nav of navigation) {
        if (!!nav.children) {
          for (const child of nav.children) {
            const hasAccess = this.ngxPermissions.getPermission(child.privilages);            
            if (!!hasAccess) return this.router.navigateByUrl(child.url, {replaceUrl: true}); 
          }
        } else {
          const hasAccess = this.ngxPermissions.getPermission(nav.privilages);
          if (!!hasAccess) return this.router.navigateByUrl(nav.url, {replaceUrl: true}); 
        }
      }
  
      return this.router.navigateByUrl('/pages/errors/403', {replaceUrl: true});;
  }
}
