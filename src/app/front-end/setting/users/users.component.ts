import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { delay, map, switchMap } from 'rxjs/operators';
import {
  NgbModal,
  NgbModalOptions,
  NgbPaginationConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { AddNewUserComponent } from '../add-new-user/add-new-user.component';
import 'rxjs/add/observable/from';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CookiesServicesService } from '../../../shared/services/cookies-services.service';
import { ApiService } from '../../../shared/services/api.service';
import { AuthService } from '../../../shared/services/auth.service';
import { setThrowInvalidWriteToSignalError } from '@angular/core/primitives/signals';
import { Router } from '@angular/router';

export interface Menu {
  canEdit: boolean;
  canView: boolean;
  selected: boolean;
  id?: number;
  title?: string;
  children?: Menu[];
}
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  usersList: any[] = [];
  userDetails: any = {};
  canEdit: boolean = true;

  constructor(
    config: NgbPaginationConfig,
    private _apiService: ApiService,
    private _loaderService: NgxUiLoaderService,
    private modalService: NgbModal,
    private _toaster: ToastrService,
    private router: Router
  ) {
    config.size = 'sm';
    config.boundaryLinks = true;
  }

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    try {
      this._loaderService.startLoader('loader-02');
      this._apiService.getUsers().subscribe((res: any) => {
        this.usersList = [];
        this.usersList = [...res?.data];
        this._loaderService.stopLoader('loader-02');
      });
    } catch (error) {
      this._loaderService.stopLoader('loader-02');
      console.error('Error loading role:', error);
    }
  }

  addNewUserFunction() {
    // const modalRef = this.modalService.open(AddNewUserComponent, {
    //   backdrop: false,
    //   keyboard: true,
    //   size: 'l',
    // });
    // modalRef.componentInstance.isEditMode = false; // Set to false for adding new user
    // modalRef.componentInstance.user = null; // No user data
    // modalRef.componentInstance.userCreated.subscribe(() => {
    //   this.getAllUsers(); // Refresh the user list
    // });
    this.router.navigate(['/settings/add_new_user']);
  }

  editThisUser(user:any) {
    console.log('Editing user:', user); // Debugging line
    const modalRef = this.modalService.open(AddNewUserComponent, {
      backdrop: false,
      keyboard: true,
      size: 'lg',
    });
    modalRef.componentInstance.isEditMode = true;
    modalRef.componentInstance.user = user;
    modalRef.componentInstance.userUpdated.subscribe(() => {
      this.getAllUsers();
    })
  }

}
