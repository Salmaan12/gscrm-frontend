import { Router } from '@angular/router';
import { ApiService } from '../../../shared/services/api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  // @ViewChild('forgotWizard', { static: false }) wizard;
  username: any;
  code: any = '';
  password: any = '';
  confirmPassword: any = '';
  public showPasswordInput: boolean = false;
  public showConfirmPasswordInput: boolean = false;
  step: number = 1; // To track the current step

  constructor(
    private _apiservice: ApiService,
    private _router: Router,
    private modalService: NgbModal,
    private toast: ToastrService,

  ) { }



  ngOnInit(): void {
    localStorage.clear();
  }

  toggleShowPassword() {
    this.showPasswordInput = !this.showPasswordInput;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPasswordInput = !this.showConfirmPasswordInput;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  verifyUser() {
    // try {
    //   this._apiservice.requestOtpForPasswordReset(this.username).subscribe(
    //     (res: any) => {
    //       if (res) {
    //         this.toast.success(res.message, 'Success!');
    //         // this.wizard.goToNextStep();
    //         // this.ngWizardService.next(); // Move to the next step
    //         this.step = 2; // Move to step 2

    //       }
    //     },
    //     (error) => {
    //       this.toast.error(error?.error?.message, 'Error');
    //     }
    //   );
    // } catch (error) {
    //   console.log(error?.error);
    //   this.toast.error(error?.error?.message, 'Error');
    // }
  }

  newPassword() {
    if (!this.code || !this.password) {
      this.toast.info('Please fill all required fields');
      return;
    }

    if (this.confirmPassword !== this.password) {
      this.toast.info('New password and confirm password does not match');
      return;
    }

    const payload = {
      username: this.username,
      otp_code: this.code,
      new_password: this.password,
    };

    // this._apiservice.verifyOtpAndResetPassword(payload).subscribe(
    //   (res: any) => {
    //     if (res) {
    //       this.toast.success(res.message, 'Success!');
    //       this.modalService.dismissAll();
    //       this._router.navigateByUrl('/auth/login');
    //     }
    //   },
    //   (error) => {
    //     this.toast.error(error?.error?.message, 'Error');
    //   }
    // );
  }
}
