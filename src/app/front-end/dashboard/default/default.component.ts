import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CookiesServicesService } from '../../../shared/services/cookies-services.service';
import { ApiService } from '../../../shared/services/api.service';
import { AuthService } from '../../../shared/services/auth.service';
import * as chartData from '../../../shared/data/dashboard/default';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
})
export class DefaultComponent implements OnInit {
  public smallBarCharts = chartData.smallBarCharts;

  [x: string]: any;
  @ViewChild('topup', { static: true }) _topupModal: any;
  @ViewChild('orderHistory', { static: true }) _orderHistoryModal: any;
  @ViewChild('tokenOpen', { static: true }) tokenOpen: any;
  @ViewChild('recharge_esim_popup', { static: true }) recharge_esim_popup: any;
  @ViewChild('cardd', { static: true }) _cardd: any;
  public WLuserName: any;
  public WLuserBalance: any;
  public WLuserToken: any;
  stripePass: boolean = true;
  stripeErrorString: any;
  WLUserByID: any = {};
  esimgo: any = {};
  iccid: any;
  bundleAmount: any;
  bundleId: any;
  simDetailsRecord: any = {};
  merchantPurchaseRecord: any[] = [];
  search: string;
  selectMethod: string = 'card';
  userId: string;
  // permissions = [];
  canEdit: boolean = true;
  plansStatics = [
    {
      title: 'Total Customer',
      value: 250,
    },
    {
      title: 'Pending Rate Work',
      value: 0,
    },
    {
      title: 'Ready Rate Work',
      value: 0,
    },
    {
      title: 'Overdue Rate Work',
      value: 0,
    },
  ];

  // plansArray = Object.entries(this.plansStatics).map(([key, value]) => ({
  //   key,
  //   value,
  // }));

  constructor(
    private cookiesServicesService: CookiesServicesService,
    private _apiService: ApiService,
    private _toast: ToastrService,
    private modalService: NgbModal,
    private _route: Router,
    private _loaderService: NgxUiLoaderService,
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.WLUserDetails();
    // this.getAllPlansStatics();
    // Get route object from the service file
    let receivedData = this.authService.getData();
    console.log('Received Data:', receivedData);
    if (receivedData) {
      // Dynamic can edit for permission
      this.canEdit = receivedData?.canEdit;
    }
  }

  openModal(id: any) {
    // this.modalService.open(TopUpModalComponent, {
    //   size: 'lg',
    //   backdrop: false,
    // });
  }

  recharge_esim() {
    // this.modalService.open(RechargeModalComponent, {
    //   size: 'lg',
    //   backdrop: false,
    // });
  }

  isDivisibleByTwo(i: number): boolean {
    return i % 2 === 0;
  }

  getAllPlansStatics() {
    this._loaderService.stopLoader('loader-02');
  }

  showToken() {
    this.modalService.open(this.tokenOpen, { size: 'lg' });
  }

  scrollToSection() {
    this._route.navigate(['/plan/assign_plan']);
  }

  getUserOrderHistory() {
    this._loaderService.stopLoader('loader-02');
  }
  WLUserDetails() {
    this._loaderService.startLoader('loader-02');
    let userDetails = JSON.parse(
      this.cookiesServicesService.getCookie('userDetails') as string
    );
    this.WLuserName = userDetails.fullName;
    this.cookiesServicesService.setCookie('userId', userDetails.id, 20); // To Set Cookie
    this._loaderService.stopLoader('loader-02');
  }
  // for refresh page
  refresh(): void {
    window.location.reload();
  }
}
