import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService } from '../../../shared/services/api.service';
import { Router } from '@angular/router';
const Swal = require('sweetalert2');

@Component({
  selector: 'app-add-new-user',
  templateUrl: './add-new-user.component.html',
  styleUrls: ['./add-new-user.component.css'],
})
export class AddNewUserComponent implements OnInit {
  @Output() userCreated = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();
  constructor(
    private modalService: NgbModal,
    private http: HttpClient,
    private _apiService: ApiService,
    private _fb: UntypedFormBuilder,
    private _toast: ToastrService,
    private _loaderService: NgxUiLoaderService,
    private router: Router
  ) { }
  usersForm!: UntypedFormGroup;
  public permissions: any[] = [];
  roles: any[] = [];
  isEditMode: boolean = false;
  public show: boolean = false;
  roleId: any = null;
  user: any = {};
  config: any = {
    searchStr: '',
    page: 1,
    pageSize: 10,
  };
  status: any[] = [
    { id: 1, value: 'approved' },
    { id: 2, value: 'rejected' },
    { id: 3, value: 'blocked' },
    { id: 4, value: 'pending' },
  ];
  statusOptions: any[] = [
    { label: 'Active', value: true },
    { label: 'Not Active', value: false }
  ];
  selectedStatus = null;
  ngOnInit(): void {
    console.log('User passed to modal:', this.user); // Debugging line

    this.initialize();
    if (!this.isEditMode) {
      this.usersForm.patchValue({ role_id: null });
      this.user?.role?.id;
    }
    if (this.isEditMode) {
      this.roleId = this.user?.role?.id;
      this.selectedStatus = this.status?.find(
        (x) => x?.value === this.user?.status
      )?.value;
      console.log(this.selectedStatus);
    }
  }

  initialize() {
    this.usersForm = this._fb.group({
      userName: this._fb.control(
        {
          value: this.isEditMode ? this.user?.userName : '',
          disabled: this.isEditMode,
        },
        Validators.required
      ),

      firstName: this._fb.control(
        {
          value: this.isEditMode ? this.user?.firstName : '',
          disabled: false,
        },
        Validators.required
      ),

      lastName: this._fb.control(
        {
          value: this.isEditMode ? this.user?.lastName : '',
          disabled: false,
        },
        Validators.required
      ),

      fullName: this._fb.control(
        {
          value: this.isEditMode ? this.user?.fullName : '',
          disabled: false,
        },
        Validators.required
      ),

      Phone: this._fb.control(
        {
          value: this.isEditMode ? this.user?.phone : '',
          disabled: this.isEditMode,
        },
        Validators.required
      ),

      email: this._fb.control(
        {
          value: this.isEditMode ? this.user?.email : '',
          disabled: this.isEditMode,
        },
        [Validators.required, Validators.email]
      ),

      dateOfBirth: this._fb.control(
        {
          value: this.isEditMode ? this.user?.dateOfBirth : '',
          disabled: false,
        },
        Validators.required
      ),

      isActive: this._fb.control(
        {
          value: this.isEditMode ? this.user?.isActive : false,
          disabled: false,
        },
        Validators.required
      ),

      password: this._fb.control(
        {
          value: '',
          disabled: false,
        },
        this.isEditMode ? [] : [Validators.required]
      ),


    });
  }

  showPassword() {
    this.show = !this.show;
  }

  saveUser() {
    Swal.fire({
      icon: 'warning',
      title: this.isEditMode
        ? 'Are you sure you want to edit this user?'
        : 'Are you sure you want to add this user?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result: any) => {
      // Only proceed if the user confirmed
      if (result.isConfirmed) {
        if (this.usersForm.invalid) return;

        if (this.isEditMode) {
          this.handleUpdateUser();
        } else {
          this.handleCreateUser();
        }
      }
    });
  }

  handleCreateUser() {
    this._loaderService.startLoader('loader-02');
    this._apiService.createUser(this.usersForm.value).subscribe(
      () => {
        this._toast.success('User created successfully');
        this._loaderService.stopLoader('loader-02');
        this.userCreated.emit(); // Emit event to notify parent
        this.router.navigate(['/settings/users/all']);
        // this.modalService.dismissAll();
      },
      (error: any) => {
        this._toast.error(error?.error?.message || 'Error creating user');
        this._loaderService.stopLoader('loader-02');
      }
    );
  }

  handleUpdateUser() {
    try {
      this._loaderService.startLoader('loader-02');
      let userUpdateData = {
        firstName: this.usersForm.controls['firstName'].value,
        lastName: this.usersForm.controls['lastName'].value,
        fullName: this.usersForm.controls['fullName'].value,
        dateOfBirth: this.usersForm.controls['dateOfBirth'].value,
        isActive: this.usersForm.controls['isActive'].value,
      }
      this._apiService.updateUser(this.user.id, userUpdateData).subscribe(
        () => {
          this._toast.success('User updated successfully');
          this._loaderService.stopLoader('loader-02');
          this.userUpdated.emit();
          this.modalService.dismissAll();
        },
        (error) => {
          this._toast.error(error?.error?.message || 'Error updating user');
          this._loaderService.stopLoader('loader-02');
        }
      );
    } catch (error) {
      this._toast.error('Error updating user');
      this._loaderService.stopLoader('loader-02');
    }
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  removeSpaces() {
    const value = this.usersForm.get('username')?.value;
    this.usersForm.get('username')?.setValue(value.replace(/\s+/g, ''));
  }
}
