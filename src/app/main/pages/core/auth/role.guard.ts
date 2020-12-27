import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NavigationRulesService } from 'app/shared/helpers';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate{
  constructor(
    private router: Router,
    private _navigationRules : NavigationRulesService,
) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.router.navigateByUrl(this._navigationRules.GetDirectByRole(), {replaceUrl: true});
  }
}
