import { Injectable } from '@angular/core';
import { NgxRolesService } from 'ngx-permissions';
import { Rule, Rules } from 'app/navigation/navigation-rules';

@Injectable({
  providedIn: 'root'
})
export class NavigationRulesService {

  private _navigationRules : Rule[];

  constructor(
    private ngxRoles: NgxRolesService
  ) {
    this._navigationRules = Rules;
  }

  public getRoleByNavigation(key: any) : string[] {
      return this._navigationRules.filter((value : Rule) => {
          return value.navbar.includes(key) || value.navbar.includes('*');
      }).map((value : Rule) => {
          return value.role;
      });
  }

  public getRoleByToolbar(key: any) : string[] {
      return this._navigationRules.filter((value : Rule) => {
          return value.toolbar.includes(key) || value.navbar.includes('*');
      }).map((value : Rule) => {
          return value.role;
      });
  }

  public getNavigationByRole() : string[] {
      return this._navigationRules.filter((value : Rule) => {
          return this.ngxRoles.getRole(value.role);
      })[0].navbar;
  } 

//   public GetRoutingByRole = () : string[] => {
//       return this._navigationRules.filter((value : Rule) => {
//           return this.ngxRoles.getRole(value.role);
//       })[0].routing;
//   }

  public getDirectByRole() : string {
    return this._navigationRules.filter((value : Rule) => {
      return this.ngxRoles.getRole(value.role);
    })[0].redirectTo;
  }

  public validateNavigationOnRole(key: string) : boolean{
      return this.getRoleByNavigation(key).some((value : string) => {
          return this.ngxRoles.getRole(value);
      })
  }

  public validateToolbarOnRole(key: string) : boolean{
      return this.getRoleByToolbar(key).some((value : string) => {
          return this.ngxRoles.getRole(value);
      })
  }
}

export function getRoleByRouter(route: string, child: string = '') : string[] {
    return Rules.filter((value : Rule) => {
        if(!!value.routing[route]) {
            return value.routing[route].includes(child) || value.routing[route].includes('*');
        }
        return !!value.routing['*'];
    }).map((value : Rule) => {
        return value.role;
    });
}