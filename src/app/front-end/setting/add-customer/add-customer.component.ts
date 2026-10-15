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
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.css',
})
export class AddCustomerComponent {
  @Output() customerCreated = new EventEmitter<void>();
  @Output() customerUpdated = new EventEmitter<void>();
  constructor(
    private modalService: NgbModal,
    private http: HttpClient,
    private _apiService: ApiService,
    private _fb: UntypedFormBuilder,
    private _toast: ToastrService,
    private _loaderService: NgxUiLoaderService,
    private router: Router,
  ) {}
  customersForm!: UntypedFormGroup;
  public permissions: any[] = [];
  roles: any[] = [];
  isEditMode: boolean = false;
  public show: boolean = false;
  roleId: any = null;
  customer: any = {};
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
    { label: 'Not Active', value: false },
  ];
  selectedStatus = null;
  ngOnInit(): void {
    console.log('User passed to modal:', this.customer); // Debugging line

    this.initialize();
    if (!this.isEditMode) {
      this.customersForm.patchValue({ role_id: null });
      this.customer?.role?.id;
    }
    if (this.isEditMode) {
      this.roleId = this.customer?.role?.id;
      this.selectedStatus = this.status?.find(
        (x) => x?.value === this.customer?.status,
      )?.value;
      console.log(this.selectedStatus);
    }
  }

  initialize() {
    this.customersForm = this._fb.group({
      customerName: this._fb.control(
        {
          value: this.isEditMode ? this.customer?.customerName : '',
          disabled: this.isEditMode,
        },
        Validators.required,
      ),

      primaryPhone: this._fb.control(
        {
          value: this.isEditMode ? this.customer?.primaryPhone : '',
          disabled: false,
        },
        Validators.required,
      ),

      secondaryPhone: this._fb.control(
        {
          value: this.isEditMode ? this.customer?.secondaryPhone : '',
          disabled: false,
        },
        Validators.required,
      ),

      cnic: this._fb.control(
        {
          value: this.isEditMode ? this.customer?.cnic : '',
          disabled: this.isEditMode,
        },
        Validators.required,
      ),

      refineCharges: this._fb.control(
        {
          value: this.isEditMode ? this.customer?.refineCharges : '',
          disabled: false,
        },
        Validators.required,
      ),

      diffCharges: this._fb.control(
        {
          value: this.isEditMode ? this.customer?.diffCharges : '',
          disabled: false,
        },
        [Validators.required],
      ),

      isActive: this._fb.control(
        {
          value: this.isEditMode ? this.customer?.isActive : false,
          disabled: false,
        },
        Validators.required,
      )
    });
  }

  showPassword() {
    this.show = !this.show;
  }

  saveCustomer() {
    Swal.fire({
      icon: 'warning',
      title: this.isEditMode
        ? 'Are you sure you want to edit this customer?'
        : 'Are you sure you want to add this customer?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result: any) => {
      if (result.isConfirmed) {
        if (this.customersForm.invalid) return;

        if (this.isEditMode) {
          this.handleUpdateCustomer();
        } else {
          this.handleCreateCustomer();
        }
      }
    });
  }

  handleCreateCustomer() {
    this._loaderService.startLoader('loader-02');
    this._apiService.createCustomer(this.customersForm.value).subscribe(
      () => {
        this._toast.success('User created successfully');
        this._loaderService.stopLoader('loader-02');
        this.customerCreated.emit(); // Emit event to notify parent
        this.router.navigate(['/settings/customers/all']);
        // this.modalService.dismissAll();
      },
      (error: any) => {
        this._toast.error(error?.error?.message || 'Error creating user');
        this._loaderService.stopLoader('loader-02');
      },
    );
  }

  handleUpdateCustomer() {
    try {
      this._loaderService.startLoader('loader-02');
      let userUpdateData = {
        ...this.customersForm.value
      };
      this._apiService.updateCustomer(this.customer.id, userUpdateData).subscribe(
        () => {
          this._toast.success('User updated successfully');
          this._loaderService.stopLoader('loader-02');
          this.customerUpdated.emit();
          this.modalService.dismissAll();
        },
        (error) => {
          this._toast.error(error?.error?.message || 'Error updating customer');
          this._loaderService.stopLoader('loader-02');
        },
      );
    } catch (error) {
      this._toast.error('Error updating customer');
      this._loaderService.stopLoader('loader-02');
    }
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  removeSpaces() {
    const value = this.customersForm.get('customerName')?.value;
    this.customersForm.get('customerName')?.setValue(value.replace(/\s+/g, ''));
  }
}
