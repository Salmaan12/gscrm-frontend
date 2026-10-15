import { CookiesServicesService } from './../../../shared/services/cookies-services.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../shared/services/api.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  public show: boolean = false;
  change_pass: UntypedFormGroup;
  WLuserName: any = '';
  userId: number = -1;
  canEdit: boolean = false;
  constructor(
    private _fb: UntypedFormBuilder,
    private _toast: ToastrService,
    private cookiesServicesService: CookiesServicesService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    let userDetails = JSON.parse(
      this.cookiesServicesService.getCookie('userDetails')
    );
    this.WLuserName = userDetails.userName;
    this.userId = userDetails?.id;
    this.initilize();
    // let receivedData = this.authService.getData();
    // console.log('Received Data:', receivedData);
    // if (receivedData) {
    //   this.canEdit = receivedData?.canEdit;
    // }
  }

  initilize() {
    this.change_pass = this._fb.group({
      id: 0,
      username: [this.WLuserName, [Validators.required]],
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]],
    });
  }

  showPassword() {
    this.show = !this.show;
  }

  submit() {
    if (this.change_pass.invalid) {
      this._toast.info('Please fill all required fields');
    }
    let confirm_password = this.change_pass?.value?.confirm_password;
    let new_password = this.change_pass?.value?.new_password;
    let password = this.change_pass?.value?.current_password;
    if (new_password !== confirm_password) {
      this._toast.error('New Password & Confirm Password does not match!');
    } else {
      console.log(this.change_pass.value);
      let payload = {
        password,
        new_password,
        // ...this.change_pass.value,
      };
      this.apiService.changeUserPassword(payload).subscribe(
        (res: any) => {
          if (res) {
            console.log(res);
            this._toast.success(res.message);
            this.reset();
          }
        },
        (error) => {
          this._toast.error(error?.error?.message);
        }
      );
    }
  }

  reset() {
    this.initilize();
  }
}
