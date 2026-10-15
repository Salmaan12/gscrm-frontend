import { ForgotPasswordComponent } from './../forgot-password/forgot-password.component';
import { CookiesServicesService } from './../../../shared/services/cookies-services.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './../../../shared/services/api.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public show: boolean = false;
  loginForm!: UntypedFormGroup;

  constructor(
    private cookiesServicesService: CookiesServicesService,
    private api_service: ApiService,
    private fb: UntypedFormBuilder,
    private router: Router,
    private _toast: ToastrService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.initilized();
  }

  initilized() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  showPassword() {
    this.show = !this.show;
  }

  openForgetPassModal() {
    let option: NgbModalOptions = {
      backdrop: false,
      keyboard: false,
      size: 'lg',
      centered: true
    };
    this.modalService.open(ForgotPasswordComponent, option);
  }

  // Simple Login
  login() {
    if (this.loginForm.invalid) {
      this._toast.error('Please fill all required fields');
      return;
    }
    this.api_service.userLogin(this.loginForm.value).subscribe(
      (res: any) => {
        if (res) {
          let userDetails = JSON.stringify(res.data);
          this.cookiesServicesService.setCookie('auth_token',res.data.auth_token,20); // To Set Cookie
          this.cookiesServicesService.setCookie('userDetails', userDetails, 20); // To Set Cookie

          this._toast.success(res.message);
          this.router.navigate(['/dashboard/default']);
        } else {
          this.router.navigate(['login']);
          this._toast.error(res.message);
        }
      },
      (error) => {
        this._toast.error(error.error.message);
      }
    );
  }
}
