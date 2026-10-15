import { CookiesServicesService } from './../../../../services/cookies-services.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
})
export class MyAccountComponent implements OnInit {
  userDetails: any;
  constructor(
    private router: Router,
    private _toast: ToastrService,
    private cookiesServicesService: CookiesServicesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userDetails = JSON.parse(
      this.cookiesServicesService.getCookie('userDetails') as string
    );
  }

  logout() {
    localStorage.clear();
    this.cookiesServicesService.deleteCookie('auth_token');
    this.cookiesServicesService.deleteCookie('userDetails');
    this.cookiesServicesService.deleteCookie('userId');
    this.router.navigate(['/auth/login']);
    this.authService.clearData();
  }
}
