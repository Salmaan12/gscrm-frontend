import { Component } from '@angular/core';
import { NgbModal, NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../shared/services/api.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { AddCustomerComponent } from '../add-customer/add-customer.component';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import 'rxjs/add/observable/from';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent {
  customersList: any[] = [];
  customersListFull: any[] = [];
  canEdit: boolean = true;
  search!: string;
  pageSizes = [10, 25, 50, 100];
  collectionSize: number = 0;
  countListData: number = 0;
  config: any = {
    searchStr: '',
    page: 1,
    pageSize: 10,
  };
  currentSortingColumn: any;
  searchString: Subject<string> = new Subject();
  switch$!: Observable<any>;

  constructor(
    config: NgbPaginationConfig,
    private _apiService: ApiService,
    private _loaderService: NgxUiLoaderService,
    private modalService: NgbModal,
    private _toaster: ToastrService,
    private router: Router,
  ) {
    config.size = 'sm';
    config.boundaryLinks = true;
  }

  updateSearch(value: any) {
    this.searchString.next(value);
  }

  ngOnInit(): void {
    this.getAllCustomersWithPagination(this.config);
    this.getAllCustomers();
    this.switch$ = this.searchString.pipe(
      switchMap((x) =>
        Observable.from(['hello']).pipe(
          delay(1000),
          map((y) => x)
        )
      )
    );
    this.switch$.subscribe((res) => {
      this.getAllCustomersWithPagination(this.config);
    });
  }

  pagination(event: any) {
    this.config.page = event;
    event--;
    this.getAllCustomersWithPagination(this.config);
  }

  handlePageSizeChange(event: any) {
    this.config.pageSize = event.target.value;
    this.config.page = 1;
    this.getAllCustomersWithPagination(this.config);
  }

  getAllCustomers() {
    try {
      this._loaderService.startLoader('loader-02');
      this._apiService.getAllCustomerList().subscribe((res: any) => {
        this.customersListFull = [];
        this.customersListFull = [...res?.data];
        this._loaderService.stopLoader('loader-02');
      });
    } catch (error) {
      this._loaderService.stopLoader('loader-02');
      console.error('Error loading role:', error);
    }
  }

  getAllCustomersWithPagination(config: any) {
    this._loaderService.startLoader('loader-02');
    this._apiService.getAllCustomersWithPagination(config).subscribe(
      (res: any) => {
        if (res) {
          this._loaderService.stopLoader('loader-02');
          this.customersList = [];
          this.customersList = res.data.list;
          this.collectionSize = res.data.total;
          this.countListData = this.customersList.length;
        }
      },
      (error: any) => {
        this._loaderService.stopLoader('loader-02');
      },
    );
  }

  editThisCustomer(customer: any) {
    console.log('Editing user:', customer); // Debugging line
    const modalRef = this.modalService.open(AddCustomerComponent, {
      backdrop: false,
      keyboard: true,
      size: 'lg',
    });
    modalRef.componentInstance.isEditMode = true;
    modalRef.componentInstance.customer = customer;
    modalRef.componentInstance.customerUpdated.subscribe(() => {
      this.getAllCustomersWithPagination(this.config);
    });
  }

  addNewCustomerFunction() {
    this.router.navigate(['/settings/add_customer']);
  }
}
