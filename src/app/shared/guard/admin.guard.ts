import { Injectable } from '@angular/core';
import { CookiesServicesService } from './../services/cookies-services.service';
import { Observable } from 'rxjs';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(
    public router: Router,
    private cookiesServicesService: CookiesServicesService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    let token = this.cookiesServicesService.getCookie('auth_token');
    let open = token ? true : false;
    if (!open) {
      this.router.navigateByUrl('/login');
    }
    return open;
  }
}
