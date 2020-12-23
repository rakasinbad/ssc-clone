import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NgxRolesService } from 'ngx-permissions';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate{
  constructor(
    private router: Router,
    private ngxRoles: NgxRolesService,
) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      if (this.ngxRoles.getRole('SALES_ADMIN_CABANG')) {        
        return this.router.navigateByUrl('/pages/orders', {replaceUrl: true});
      }

      return this.router.navigateByUrl('/pages/account', {replaceUrl: true});
  }
}
