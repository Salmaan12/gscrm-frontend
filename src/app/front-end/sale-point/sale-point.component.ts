import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../shared/services/api.service';
import { Router } from '@angular/router';
import { ThermalPrintComponent } from './thermal-print/thermal-print.component';
import { HelperService } from '../../shared/services/helper.service';

/* =========================================================
   INTERFACES
========================================================= */

interface Customer {
  id: number;
  customerName: string;
  primaryPhone: string;
  secondaryPhone: string;
  cnic: string;
  refineCharges: string;
  diffCharges: string;
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
}

interface ProductBrand {
  id: number;
  productId: number;
  name: string;
  isActive: boolean;
}

interface ProductSku {
  id: number;
  productBrandId: number;
  name: string;
  weightInGM: number;
  isActive: boolean;
  makings: ProductMaking[];
}

interface ProductMaking {
  id: number;
  makingCharges: string;
}

interface SavedEntry {
  localId: number;

  referenceNo: string;
  createdDate: string;
  createdTime: string;

  customerId: number;
  customerName: string;

  transactionCategory: 'RECEIVED' | 'GIVEN';

  productType: string;
  productId: number | null;

  productDetails: any;

  amount: number;
  weight: number;

  pureWeight: number;
  report: number;

  rate: number;
  qty: number;

  difference: number;
  differenceTotal: number;
  making: number;
  makingTotal: number;
  refining: number;
  refiningTotal: number;

  karat: number;

  status: 'PENDING';
}

/* =========================================================
   COMPONENT
========================================================= */

@Component({
  selector: 'app-sale-point',
  templateUrl: './sale-point.component.html',
  styleUrls: ['./sale-point.component.css'],
})
export class SalePointComponent implements OnInit {
  @ViewChild(ThermalPrintComponent)
  thermalPrint!: ThermalPrintComponent;
  /* =======================================================
     FORMS
  ======================================================= */

  salePointForm!: FormGroup;

  receivedForm!: FormGroup;

  givenForm!: FormGroup;

  private readonly requiredProductFields: Record<string, string[]> = {
    CASH: ['Amount', 'Weight', 'Diff'],
    LAB: ['Report', 'Weight', 'PureWeight'],
    PC: ['BrandId', 'SkuId', 'Qty'],
    BAR: ['BrandId', 'SkuId', 'Qty', 'Making'],
    COIN: ['BrandId', 'SkuId', 'Qty', 'Making', 'Karat'],
    GINNI: ['Weight', 'Report', 'PureWeight'],
    SILVER: ['BrandId', 'SkuId', 'Weight', 'Qty', 'Making'],
  };

  /* =======================================================
     CUSTOMERS
  ======================================================= */

  customers: Customer[] = [];
  customer: Customer | null = null;

  /* =======================================================
     PRODUCTS
  ======================================================= */

  products: Product[] = [];

  productBrands: ProductBrand[] = [];

  productSkus: ProductSku[] = [];

  filteredBrands: ProductBrand[] = [];

  filteredSkus: ProductSku[] = [];

  filteredMakings: ProductMaking[] = [];

  /* =======================================================
     SELECTED PRODUCT DATA
  ======================================================= */

  selectedProduct: Product | null = null;

  selectedProductType = '';

  selectedBrand: ProductBrand | null = null;

  selectedSku: ProductSku | null = null;

  selectedMaking: ProductMaking | null = null;

  /* =======================================================
     SAVED ENTRIES
  ======================================================= */

  savedEntries: SavedEntry[] = [];

  /* =======================================================
     UI STATE
  ======================================================= */

  isSubmitting = false;

  successMessage = '';

  errorMessage = '';

  /* =======================================================
     CONSTRUCTOR
  ======================================================= */

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private _helper: HelperService,
    private _toast: ToastrService,
    private _apiService: ApiService,
    private router: Router,
    private location: Location,
  ) {}

  /* =======================================================
     INIT
  ======================================================= */

  ngOnInit(): void {
    this.createForms();
    this.getAllProductsDetails();
    this.getAllCustomers();
    this.setupLabCalculation();
    this.setupPCCalculation();
    this.setupBarCalculation();
    this.setupCoinCalculation();
    this.setupGinniCalculation();
    this.setupCashCalculation();
  }

  /* =======================================================
     CREATE ALL FORMS
  ======================================================= */

  createForms(): void {
    /*
     * Common transaction information
     */

    this.salePointForm = this.fb.group({
      createdDate: [
        {
          value: this.getCurrentDate(),
          disabled: true,
        },
      ],

      createdTime: [
        {
          value: this.getCurrentTime(),
          disabled: true,
        },
      ],

      referenceNo: [
        {
          value: this.generateReferenceNo(),
          disabled: true,
        },
      ],

      customerId: [null, Validators.required],

      buyRateAmount: [450000, Validators.required],

      sellRateAmount: [455000, Validators.required],

      productType: ['LAB', Validators.required],
    });

    /*
     * Received
     */

    this.receivedForm = this.createProductForm('received');

    /*
     * Given
     */

    this.givenForm = this.createProductForm('given');
  }

  /* =======================================================
     CREATE PRODUCT FORM
  ======================================================= */

  createProductForm(category: 'received' | 'given'): FormGroup {
    const prefix = category === 'received' ? 'received' : 'given';

    return this.fb.group({
      /* ===================================================
         CASH
      =================================================== */

      [`${prefix}CashCurrency`]: ['PKR'],

      [`${prefix}CashAmount`]: [null],

      [`${prefix}CashWeight`]: [null],

      [`${prefix}CashDiff`]: [null],

      [`${prefix}CashDiffAmount`]: [null],

      /* ===================================================
         LAB
      =================================================== */

      [`${prefix}LabReport`]: [''],

      [`${prefix}LabWeight`]: [null],

      [`${prefix}LabPureWeight`]: [null],

      [`${prefix}LabTotalAmount`]: [null],

      [`${prefix}LabDiff`]: [null],

      [`${prefix}LabDiffAmount`]: [null],

      [`${prefix}LabTestingFeePW`]: [null],

      [`${prefix}LabTestingFeeOA`]: [null],

      [`${prefix}LabQty`]: [null],

      /* ===================================================
         PC
      =================================================== */

      [`${prefix}PcBrandId`]: [null],

      [`${prefix}PcSkuId`]: [null],

      [`${prefix}PcWeight`]: [null],

      [`${prefix}PcDiff`]: [null],

      [`${prefix}PcQty`]: [null],

      [`${prefix}PcTotalAmount`]: [null],

      /* ===================================================
         BAR
      =================================================== */

      [`${prefix}BarBrandId`]: [null],

      [`${prefix}BarSkuId`]: [null],

      [`${prefix}BarWeight`]: [null],

      [`${prefix}BarQty`]: [null],

      [`${prefix}BarMaking`]: [null],

      [`${prefix}BarMakingCharges`]: [null],

      [`${prefix}BarDiff`]: [null],

      [`${prefix}BarDiscount`]: [null],

      [`${prefix}BarTotalAmount`]: [null],

      /* ===================================================
         COIN
      =================================================== */

      [`${prefix}CoinBrandId`]: [null],

      [`${prefix}CoinSkuId`]: [null],

      [`${prefix}CoinWeight`]: [null],

      [`${prefix}CoinQty`]: [null],

      [`${prefix}CoinMaking`]: [null],

      [`${prefix}CoinKarat`]: [null],

      [`${prefix}CoinPureWeight`]: [null],

      [`${prefix}CoinDiff`]: [null],

      [`${prefix}CoinTotalAmount`]: [null],

      /* ===================================================
         GINNI
      =================================================== */

      [`${prefix}GinniWeight`]: [null],

      [`${prefix}GinniRefineAmount`]: [null],

      [`${prefix}GinniRefiningCharges`]: [null],

      [`${prefix}GinniReport`]: [''],

      [`${prefix}GinniPureWeight`]: [null],

      [`${prefix}GinniTotalAmount`]: [null],

      /* ===================================================
         SILVER
      =================================================== */

      [`${prefix}SilverBrandId`]: [null],

      [`${prefix}SilverSkuId`]: [null],

      [`${prefix}SilverWeight`]: [null],

      [`${prefix}SilverQty`]: [null],

      [`${prefix}SilverMaking`]: [null],

      [`${prefix}SilverMakingPerUnit`]: [null],

      [`${prefix}SilverRawalRod`]: [null],

      [`${prefix}SilverTotalAmount`]: [null],
    });
  }

  setupLabCalculation(): void {
    this.receivedForm.get('receivedLabReport')?.valueChanges.subscribe(() => {
      this.calculateReceivedLabPureWeight();
    });

    this.receivedForm.get('receivedLabWeight')?.valueChanges.subscribe(() => {
      this.calculateReceivedLabPureWeight();
    });

    this.givenForm.get('givenLabReport')?.valueChanges.subscribe(() => {
      this.calculateGivenLabPureWeight();
    });

    this.givenForm.get('givenLabWeight')?.valueChanges.subscribe(() => {
      this.calculateGivenLabPureWeight();
    });
  }

  setupPCCalculation(): void {
    this.receivedForm.get('receivedPcQty')?.valueChanges.subscribe(() => {
      this.calculateReceivedPC();
    });

    this.givenForm.get('givenPcQty')?.valueChanges.subscribe(() => {
      this.calculateGivenPC();
    });
  }

  setupBarCalculation(): void {
    this.receivedForm.get('receivedBarQty')?.valueChanges.subscribe(() => {
      this.calculateReceivedBar();
    });

    this.givenForm.get('givenBarQty')?.valueChanges.subscribe(() => {
      this.calculateGivenBar();
    });
  }

  setupCoinCalculation(): void {
    this.receivedForm.get('receivedCoinQty')?.valueChanges.subscribe(() => {
      this.calculateReceivedCoin();
    });

    this.givenForm.get('givenCoinQty')?.valueChanges.subscribe(() => {
      this.calculateGivenCoin();
    });
    this.receivedForm.get('receivedCoinKarat')?.valueChanges.subscribe(() => {
      this.calculateReceivedCoin();
    });

    this.givenForm.get('givenCoinKarat')?.valueChanges.subscribe(() => {
      this.calculateGivenCoin();
    });
  }

  calculateReceivedCoin(): void {
    const coinWeight = Number(this.selectedSku?.weightInGM || 0);
    const coinQty = this.receivedForm.get('receivedCoinQty')?.value || 0;
    const coinKarat = this.receivedForm.get('receivedCoinKarat')?.value || 24;
    const coinTotalWeight = coinWeight * coinQty;
    const pureWeight = (coinTotalWeight * (coinKarat / 24)).toFixed(4);
    const coinMaking = Number(
      (this.selectedSku?.makings.length ?? 0) > 0
        ? this.selectedSku?.makings[0].makingCharges
        : 0,
    );
    const coinMakingTotalAmount = coinMaking * coinQty;
    const coinTotalAmount =
      (coinTotalWeight / 11.664) *
      (this.salePointForm.get('buyRateAmount')?.value || 0);
    this.receivedForm
      .get('receivedCoinMaking')
      ?.setValue(coinMakingTotalAmount, { emitEvent: false });
    this.receivedForm
      .get('receivedCoinTotalAmount')
      ?.setValue(coinTotalAmount.toFixed(3), { emitEvent: false });
    this.receivedForm
      .get('receivedCoinPureWeight')
      ?.setValue(pureWeight, { emitEvent: false });
  }

  calculateGivenCoin(): void {
    const coinWeight = Number(this.selectedSku?.weightInGM || 0);
    const coinQty = this.givenForm.get('givenCoinQty')?.value || 0;
    const coinKarat = this.givenForm.get('givenCoinKarat')?.value || 24;
    const coinTotalWeight = coinWeight * coinQty;
    const pureWeight = (coinTotalWeight * (coinKarat / 24)).toFixed(4);
    const coinMaking = Number(
      (this.selectedSku?.makings.length ?? 0)
        ? this.selectedSku?.makings[0].makingCharges
        : 0,
    );
    const coinMakingTotalAmount = coinMaking * coinQty;
    const coinTotalAmount =
      (coinTotalWeight / 11.664) *
      (this.salePointForm.get('sellRateAmount')?.value || 0);
    this.givenForm
      .get('givenCoinMaking')
      ?.setValue(coinMakingTotalAmount, { emitEvent: false });
    this.givenForm
      .get('givenCoinTotalAmount')
      ?.setValue(coinTotalAmount.toFixed(3), { emitEvent: false });
    this.givenForm
      .get('givenCoinPureWeight')
      ?.setValue(pureWeight, { emitEvent: false });
  }

  calculateReceivedBar(): void {
    const barWeight = Number(this.selectedSku?.weightInGM || 0);
    const barQty = this.receivedForm.get('receivedBarQty')?.value || 0;
    const barTotalWeight = barWeight * barQty;
    const barMaking = Number(
      (this.selectedSku?.makings.length ?? 0) > 0
        ? this.selectedSku?.makings[0].makingCharges
        : 0,
    );
    const barMakingTotalAmount = barMaking * barQty;
    const barTotalAmount =
      (barTotalWeight / 11.664) *
      (this.salePointForm.get('buyRateAmount')?.value || 0);
    this.receivedForm
      .get('receivedBarMaking')
      ?.setValue(barMakingTotalAmount, { emitEvent: false });
    this.receivedForm
      .get('receivedBarTotalAmount')
      ?.setValue(barTotalAmount.toFixed(3), { emitEvent: false });
  }

  calculateGivenBar(): void {
    const barWeight = Number(this.selectedSku?.weightInGM || 0);
    const barQty = this.givenForm.get('givenBarQty')?.value || 0;
    const barTotalWeight = barWeight * barQty;
    const barMaking = Number(
      (this.selectedSku?.makings.length ?? 0)
        ? this.selectedSku?.makings[0].makingCharges
        : 0,
    );
    const barMakingTotalAmount = barMaking * barQty;
    const barTotalAmount =
      (barTotalWeight / 11.664) *
      (this.salePointForm.get('sellRateAmount')?.value || 0);
    this.givenForm
      .get('givenBarMaking')
      ?.setValue(barMakingTotalAmount, { emitEvent: false });
    this.givenForm
      .get('givenBarTotalAmount')
      ?.setValue(barTotalAmount.toFixed(3), { emitEvent: false });
  }

  calculateReceivedPC(): void {
    const pcWeight = Number(this.selectedSku?.weightInGM || 0);
    const pcQty = this.receivedForm.get('receivedPcQty')?.value || 0;
    const pcTotalWeight = pcWeight * pcQty;
    const pcDiff = this.customer ? Number(this.customer.diffCharges || 0) : 0;
    const pcDiffTotalAmount = pcQty * pcDiff;
    const pcTotalAmount =
      (pcTotalWeight / 11.664) *
      (this.salePointForm.get('buyRateAmount')?.value || 0);
    this.receivedForm
      .get('receivedPcWeight')
      ?.setValue(pcTotalWeight, { emitEvent: false });
    this.receivedForm
      .get('receivedPcTotalAmount')
      ?.setValue(pcTotalAmount.toFixed(3), { emitEvent: false });
    this.receivedForm
      .get('receivedPcDiff')
      ?.setValue(pcDiffTotalAmount, { emitEvent: false });
  }

  calculateGivenPC(): void {
    const pcWeight = Number(this.selectedSku?.weightInGM || 0);
    const pcQty = this.givenForm.get('givenPcQty')?.value || 0;
    const pcTotalWeight = pcWeight * pcQty;
    const pcDiff = this.customer ? Number(this.customer.diffCharges || 0) : 0;
    const pcDiffTotalAmount = pcQty * pcDiff;
    const pcTotalAmount =
      (pcTotalWeight / 11.664) *
      (this.salePointForm.get('sellRateAmount')?.value || 0);
    this.givenForm
      .get('givenPcWeight')
      ?.setValue(pcTotalWeight, { emitEvent: false });
    this.givenForm
      .get('givenPcTotalAmount')
      ?.setValue(pcTotalAmount.toFixed(3), { emitEvent: false });
    this.givenForm
      .get('givenPcDiff')
      ?.setValue(pcDiffTotalAmount, { emitEvent: false });
  }

  calculateReceivedLabPureWeight(): void {
    const totalRatti = Number(96);
    const report = Number(
      this.receivedForm.get('receivedLabReport')?.value || 0,
    );
    const weight = Number(
      this.receivedForm.get('receivedLabWeight')?.value || 0,
    );
    const buyRateAmount = Number(
      this.salePointForm.get('buyRateAmount')?.value || 0,
    );
    const tolaWeight = Number(11.664);

    if (report >= 0 && weight > 0) {
      const pureWeight = ((totalRatti - report) / totalRatti) * weight;
      this.receivedForm
        .get('receivedLabPureWeight')
        ?.setValue(Number(pureWeight.toFixed(4)), { emitEvent: false });
      if (pureWeight > 0) {
        const totalAmount = (pureWeight / tolaWeight) * buyRateAmount;
        this.receivedForm
          .get('receivedLabTotalAmount')
          ?.setValue(Number(totalAmount.toFixed(3)), { emitEvent: false });
      } else {
        this.receivedForm
          .get('receivedLabTotalAmount')
          ?.setValue(0, { emitEvent: false });
      }
    } else {
      this.receivedForm
        .get('receivedLabPureWeight')
        ?.setValue(null, { emitEvent: false });
    }
  }

  calculateGivenLabPureWeight(): void {
    const report = Number(this.givenForm.get('givenLabReport')?.value || 0);
    const totalRatti = Number(96);
    const tolaWeight = Number(11.664);
    const sellRateAmount = Number(
      this.salePointForm.get('sellRateAmount')?.value || 0,
    );
    const weight = Number(this.givenForm.get('givenLabWeight')?.value || 0);

    if (report >= 0 && weight > 0) {
      const pureWeight = ((totalRatti - report) / totalRatti) * weight;
      this.givenForm
        .get('givenLabPureWeight')
        ?.setValue(Number(pureWeight.toFixed(4)), { emitEvent: false });
      if (pureWeight > 0) {
        const totalAmount = (pureWeight / tolaWeight) * sellRateAmount;
        this.givenForm
          .get('givenLabTotalAmount')
          ?.setValue(Number(totalAmount.toFixed(3)), { emitEvent: false });
      } else {
        this.givenForm
          .get('givenLabTotalAmount')
          ?.setValue(0, { emitEvent: false });
      }
    } else {
      this.givenForm
        .get('givenLabPureWeight')
        ?.setValue(null, { emitEvent: false });
    }
  }

  setupGinniCalculation(): void {
    this.receivedForm.get('receivedGinniReport')?.valueChanges.subscribe(() => {
      this.calculateReceivedGinniPureWeight();
    });

    this.receivedForm.get('receivedGinniWeight')?.valueChanges.subscribe(() => {
      this.calculateReceivedGinniPureWeight();
    });

    this.givenForm.get('givenGinniReport')?.valueChanges.subscribe(() => {
      this.calculateGivenGinniPureWeight();
    });

    this.givenForm.get('givenGinniWeight')?.valueChanges.subscribe(() => {
      this.calculateGivenGinniPureWeight();
    });
  }

  calculateReceivedGinniPureWeight(): void {
    const totalRatti = Number(96);
    const report = Number(
      this.receivedForm.get('receivedGinniReport')?.value || 0,
    );
    const weight = Number(
      this.receivedForm.get('receivedGinniWeight')?.value || 0,
    );
    const buyRateAmount = Number(
      this.salePointForm.get('buyRateAmount')?.value || 0,
    );
    const tolaWeight = Number(11.664);

    if (report >= 0 && weight > 0) {
      const pureWeight = ((totalRatti - report) / totalRatti) * weight;
      this.receivedForm
        .get('receivedGinniPureWeight')
        ?.setValue(Number(pureWeight.toFixed(4)), { emitEvent: false });
      if (pureWeight > 0) {
        const totalAmount = (pureWeight / tolaWeight) * buyRateAmount;
        this.receivedForm
          .get('receivedGinniTotalAmount')
          ?.setValue(Number(totalAmount.toFixed(3)), { emitEvent: false });
      } else {
        this.receivedForm
          .get('receivedGinniTotalAmount')
          ?.setValue(0, { emitEvent: false });
      }
    } else {
      this.receivedForm
        .get('receivedGinniPureWeight')
        ?.setValue(null, { emitEvent: false });
    }

    const refiningCharges = this.customer
      ? Number(this.customer.refineCharges || 0)
      : 0;
    const refiningChargesTotal =
      (weight < 1 ? 1 : weight > 10 ? weight : 11) * refiningCharges;
    this.receivedForm
      .get('receivedGinniRefiningCharges')
      ?.setValue(Number(refiningChargesTotal.toFixed(2)), { emitEvent: false });
  }

  calculateGivenGinniPureWeight(): void {
    const report = Number(this.givenForm.get('givenGinniReport')?.value || 0);
    const totalRatti = Number(96);
    const tolaWeight = Number(11.664);
    const sellRateAmount = Number(
      this.salePointForm.get('sellRateAmount')?.value || 0,
    );
    const weight = Number(this.givenForm.get('givenGinniWeight')?.value || 0);

    if (report >= 0 && weight > 0) {
      const pureWeight = ((totalRatti - report) / totalRatti) * weight;
      this.givenForm
        .get('givenGinniPureWeight')
        ?.setValue(Number(pureWeight.toFixed(4)), { emitEvent: false });
      if (pureWeight > 0) {
        const totalAmount = (pureWeight / tolaWeight) * sellRateAmount;
        this.givenForm
          .get('givenGinniTotalAmount')
          ?.setValue(Number(totalAmount.toFixed(3)), { emitEvent: false });
      } else {
        this.givenForm
          .get('givenGinniTotalAmount')
          ?.setValue(0, { emitEvent: false });
      }
    } else {
      this.givenForm
        .get('givenGinniPureWeight')
        ?.setValue(null, { emitEvent: false });
    }

    const refiningCharges = this.customer
      ? Number(this.customer.refineCharges || 0)
      : 0;
    const refiningChargesTotal =
      (weight < 1 ? 1 : weight > 10 ? weight : 11) * refiningCharges;
    this.givenForm
      .get('givenGinniRefiningCharges')
      ?.setValue(Number(refiningChargesTotal.toFixed(2)), { emitEvent: false });
  }

  setupCashCalculation(): void {
    this.receivedForm.get('receivedCashAmount')?.valueChanges.subscribe(() => {
      this.calculateReceivedCashWeight();
    });

    this.givenForm.get('givenCashAmount')?.valueChanges.subscribe(() => {
      this.calculateGivenCashWeight();
    });
    this.receivedForm.get('receivedCashDiff')?.valueChanges.subscribe(() => {
      this.calculateReceivedCashWeight();
      this.calculateReceivedWeightCash();
    });

    this.givenForm.get('givenCashDiff')?.valueChanges.subscribe(() => {
      this.calculateGivenCashWeight();
      this.calculateGivenWeightCash();
    });

    this.receivedForm.get('receivedCashWeight')?.valueChanges.subscribe(() => {
      this.calculateReceivedWeightCash();
    });

    this.givenForm.get('givenCashWeight')?.valueChanges.subscribe(() => {
      this.calculateGivenWeightCash();
    });
  }

  calculateGivenWeightCash(): void {
    const tolaWeight = Number(11.664);
    const weight = Number(this.givenForm.get('givenCashWeight')?.value || 0);
    const diff = Number(this.givenForm.get('givenCashDiff')?.value || 0);
    const buyRateAmount = Number(
      this.salePointForm.get('buyRateAmount')?.value || 0,
    );
    const gramAmount = (buyRateAmount - diff) / tolaWeight;
    const amount = weight * gramAmount;
    this.givenForm
      .get('givenCashAmount')
      ?.setValue(Number(amount.toFixed(2)), { emitEvent: false });
  }

  calculateReceivedWeightCash(): void {
    const tolaWeight = Number(11.664);
    const weight = Number(
      this.receivedForm.get('receivedCashWeight')?.value || 0,
    );
    const diff = Number(this.receivedForm.get('receivedCashDiff')?.value || 0);
    const sellRateAmount = Number(
      this.salePointForm.get('sellRateAmount')?.value || 0,
    );
    const gramAmount = (sellRateAmount - diff) / tolaWeight;
    const amount = weight * gramAmount;
    this.receivedForm
      .get('receivedCashAmount')
      ?.setValue(Number(amount.toFixed(2)), { emitEvent: false });
  }

  calculateReceivedCashWeight(): void {
    const amount = Number(
      this.receivedForm.get('receivedCashAmount')?.value || 0,
    );
    const diff = Number(this.receivedForm.get('receivedCashDiff')?.value || 0);

    const sellRateAmount = Number(
      this.salePointForm.get('sellRateAmount')?.value || 0,
    );
    const tolaWeight = Number(11.664);
    const weight = (amount / (sellRateAmount - diff)) * tolaWeight;
    this.receivedForm
      .get('receivedCashWeight')
      ?.setValue(Number(weight.toFixed(4)), { emitEvent: false });
  }

  calculateGivenCashWeight(): void {
    const amount = Number(this.givenForm.get('givenCashAmount')?.value || 0);
    const diff = Number(this.givenForm.get('givenCashDiff')?.value || 0);
    const buyRateAmount = Number(
      this.salePointForm.get('buyRateAmount')?.value || 0,
    );
    const tolaWeight = Number(11.664);
    const weight = (amount / (buyRateAmount - diff)) * tolaWeight;
    this.givenForm
      .get('givenCashWeight')
      ?.setValue(Number(weight.toFixed(4)), { emitEvent: false });
  }

  onCustomerChange(customerId: number | null): void {
    this.customer = this.customers.find((c) => c.id === customerId) || null;
    this.setDefaultValuesForForms();
  }

  /* =======================================================
     GET PRODUCTS
  ======================================================= */

  getAllProductsDetails(): void {
    this._apiService.getAllProductsWithBrandsAndSku().subscribe({
      next: (response: any) => {
        if (response.code !== 200) {
          this._toast.error(response.message || 'Unable to load products.');

          return;
        }

        this.products = (response.data?.products || []).filter(
          (product: Product) => product.isActive,
        );

        this.productBrands = (response.data?.brands || []).filter(
          (brand: ProductBrand) => brand.isActive,
        );

        this.productSkus = (response.data?.skus || []).filter(
          (sku: ProductSku) => sku.isActive,
        );

        const labProduct = this.products.find(
          (product) => product.name.toUpperCase() === 'LAB',
        );

        if (labProduct) {
          this.selectedProduct = labProduct;

          this.salePointForm.patchValue({
            productType: labProduct.name,
          });

          this.onProductChange(labProduct.id);
        }
      },

      error: (error) => {
        console.error('Product API error:', error);

        this._toast.error('Error fetching products.');
      },
    });
  }

  getAllCustomers(): void {
    this._apiService.getAllCustomerList().subscribe({
      next: (response: any) => {
        if (response.code !== 200) {
          this._toast.error(response.message || 'Unable to load customers.');
          return;
        }
        this.customers = response.data || [];
      },
      error: (error) => {
        this._toast.error('Error fetching customers.');
      },
    });
  }

  /* =======================================================
     PRODUCT CHANGE
  ======================================================= */

  onProductChange(productId: number | string | null): void {
    this.resetProductSelection();

    if (productId === null || productId === undefined || productId === '') {
      return;
    }

    const id = Number(productId);

    this.selectedProduct =
      this.products.find((product) => product.id === id) || null;

    if (!this.selectedProduct) {
      return;
    }

    this.selectedProductType = this.selectedProduct.name;

    this.filteredBrands = this.productBrands.filter(
      (brand) => brand.productId === this.selectedProduct!.id && brand.isActive,
    );

    this.setDefaultValuesForForms();
  }

  setDefaultValuesForForms(): void {
    this.receivedForm.patchValue({
      receivedPcDiff: this.customer
        ? Number(this.customer.diffCharges || 0)
        : 0,
      receivedGinniRefiningCharges: this.customer
        ? Number(this.customer.refineCharges || 0)
        : 0,
      receivedCashDiff: this.customer
        ? Number(this.customer.diffCharges || 0)
        : 0,
    });
    this.givenForm.patchValue({
      givenPcDiff: this.customer ? Number(this.customer.diffCharges || 0) : 0,
      givenGinniRefiningCharges: this.customer
        ? Number(this.customer.refineCharges || 0)
        : 0,
      givenCashDiff: this.customer ? Number(this.customer.diffCharges || 0) : 0,
    });
  }

  /* =======================================================
     GET SECTION PREFIX
  ======================================================= */

  getSectionPrefix(category: 'RECEIVED' | 'GIVEN'): string {
    const categoryPrefix = category === 'RECEIVED' ? 'received' : 'given';

    switch (this.selectedProductType?.toUpperCase()) {
      case 'LAB':
        return `${categoryPrefix}Lab`;

      case 'PC':
        return `${categoryPrefix}Pc`;

      case 'BAR':
        return `${categoryPrefix}Bar`;

      case 'COIN':
        return `${categoryPrefix}Coin`;

      case 'GINNI':
        return `${categoryPrefix}Ginni`;

      case 'SILVER':
        return `${categoryPrefix}Silver`;

      case 'CASH':
        return `${categoryPrefix}Cash`;

      default:
        return categoryPrefix;
    }
  }

  /* =======================================================
     BRAND CHANGE
  ======================================================= */

  onBrandChange(
    brandId: number | string | null,
    category: 'RECEIVED' | 'GIVEN',
  ): void {
    this.selectedBrand = null;

    this.selectedSku = null;

    this.selectedMaking = null;

    this.filteredSkus = [];

    this.filteredMakings = [];

    if (brandId === null || brandId === undefined || brandId === '') {
      return;
    }

    const id = Number(brandId);

    this.selectedBrand =
      this.filteredBrands.find((brand) => brand.id === id) || null;

    if (!this.selectedBrand) {
      return;
    }

    this.filteredSkus = this.productSkus.filter(
      (sku) => sku.productBrandId === this.selectedBrand!.id && sku.isActive,
    );

    const prefix = this.getSectionPrefix(category);

    const form = category === 'RECEIVED' ? this.receivedForm : this.givenForm;

    form.patchValue({
      [`${prefix}SkuId`]: null,

      [`${prefix}Weight`]: null,

      [`${prefix}MakingCharges`]: null,
    });
  }

  /* =======================================================
     SKU CHANGE
  ======================================================= */

  onSkuChange(
    skuId: number | string | null,
    category: 'RECEIVED' | 'GIVEN',
  ): void {
    this.selectedSku = null;

    this.selectedMaking = null;

    this.filteredMakings = [];

    if (skuId === null || skuId === undefined || skuId === '') {
      return;
    }

    const id = Number(skuId);

    this.selectedSku = this.filteredSkus.find((sku) => sku.id === id) || null;

    if (!this.selectedSku) {
      return;
    }

    this.filteredMakings = this.selectedSku.makings || [];

    const weight = Number(this.selectedSku.weightInGM || 0);

    const making =
      this.filteredMakings.length > 0
        ? Number(this.filteredMakings[0].makingCharges || 0)
        : 0;

    const prefix = this.getSectionPrefix(category);

    const form = category === 'RECEIVED' ? this.receivedForm : this.givenForm;

    form.patchValue({
      [`${prefix}Weight`]: weight,

      [`${prefix}Making`]: making,
    });
    if (this.selectedProductType?.toUpperCase() == 'COIN') {
      form.patchValue({
        [`${prefix}Karat`]: '24',
      });
    }
  }

  /* =======================================================
     MAKING CHANGE
  ======================================================= */

  //   onMakingChange(
  //     makingId: number | string | null,
  //     category: 'RECEIVED' | 'GIVEN',
  //   ): void {
  //     this.selectedMaking = null;

  //     if (makingId === null || makingId === undefined || makingId === '') {
  //       return;
  //     }

  //     const id = Number(makingId);

  //     this.selectedMaking =
  //       this.filteredMakings.find((making) => making.id === id) || null;

  //     if (!this.selectedMaking) {
  //       return;
  //     }

  //     const makingCharges = Number(this.selectedMaking.makingCharges || 0);

  //     const prefix = this.getSectionPrefix(category);

  //     const form = category === 'RECEIVED' ? this.receivedForm : this.givenForm;

  //     form.patchValue({
  //       [`${prefix}MakingCharges`]: makingCharges,
  //     });
  //   }

  /* =======================================================
     SELECTED CUSTOMER
  ======================================================= */

  get selectedCustomer(): Customer | undefined {
    const customerId = this.salePointForm.get('customerId')?.value;

    return this.customers.find(
      (customer) => customer.id === Number(customerId),
    );
  }

  /* =======================================================
     PRODUCT TYPE
  ======================================================= */

  get productType(): string {
    return this.selectedProductType;
  }

  /* =======================================================
     SAVE ENTRY
  ======================================================= */

  saveEntry(category: 'RECEIVED' | 'GIVEN'): void {
    this.clearMessages();

    const customerId = this.salePointForm.get('customerId');

    if (customerId?.invalid) {
      customerId.markAsTouched();

      this._toast.error('Please select a customer.');

      return;
    }

    if (!this.selectedProductType) {
      this._toast.error('Please select product type.');

      return;
    }

    const customer = this.selectedCustomer;

    if (!customer) {
      this._toast.error('Please select a customer.');

      return;
    }

    const form = category === 'RECEIVED' ? this.receivedForm : this.givenForm;

    const productType = this.selectedProductType.toUpperCase();
    const requiredFields = this.requiredProductFields[productType] || [];

    if (requiredFields.length > 0) {
      const prefix = this.getSectionPrefix(category);
      const requiredControls = requiredFields.map((field) =>
        form.get(`${prefix}${field}`),
      );

      requiredControls.forEach((control) => control?.markAsTouched());

      if (
        requiredControls.some(
          (control) =>
            !control ||
            control.value === null ||
            control.value === undefined ||
            control.value === '',
        )
      ) {
        this._toast.error(
          `Please complete all ${this.selectedProductType} fields in the ${category === 'RECEIVED' ? 'Received' : 'Given'} section.`,
        );

        return;
      }
    }

    const entry: SavedEntry = {
      localId: Date.now(),

      referenceNo: this.salePointForm.getRawValue().referenceNo,

      createdDate: this.salePointForm.getRawValue().createdDate,

      createdTime: this.salePointForm.getRawValue().createdTime,

      customerId: customer.id,

      customerName: customer.customerName,

      transactionCategory: category,

      productType: this.selectedProductType,

      productId: this.selectedProduct?.id || 0,

      productDetails: this.getProductDetails(form, category),

      amount: this.getCurrentAmount(form, category),

      weight: this.getCurrentWeight(form, category),

      pureWeight: this.getPureWeight(form, category),

      report: this.getReport(form, category),

      qty: this.getQty(form, category),

      difference: this.getDiff(),
      differenceTotal: this.getDiffTotal(form, category),
      making: this.getMaking(),
      makingTotal: this.getMakingTotal(form, category),
      refining: this.getRefining(),
      refiningTotal: this.getRefiningTotal(form, category),

      karat: this.getKarat(form, category),

      rate:
        category === 'RECEIVED'
          ? this.selectedProductType.toUpperCase() === 'CASH'
            ? this.salePointForm.get('sellRateAmount')?.value || 0
            : this.salePointForm.get('buyRateAmount')?.value || 0
          : this.selectedProductType.toUpperCase() === 'CASH'
            ? this.salePointForm.get('buyRateAmount')?.value || 0
            : this.salePointForm.get('sellRateAmount')?.value || 0,

      status: 'PENDING',
    };

    this.savedEntries.push(entry);

    if (
      (entry.differenceTotal > 0 ||
        entry.makingTotal > 0 ||
        entry.refiningTotal > 0) &&
      (entry.productType === 'PC' ||
        entry.productType === 'Ginni' ||
        entry.productType === 'Bar' ||
        entry.productType === 'Coin')
    ) {
      const productTypeLitreral =
        entry.productType === 'PC'
          ? ` - Difference (${entry.difference})`
          : entry.productType === 'Ginni'
            ? ` - Refining (${entry.refining})`
            : ` - Making (${entry.making})`;
      const differenceEntry: SavedEntry = {
        localId: Date.now(),

        referenceNo: this.salePointForm.getRawValue().referenceNo,

        createdDate: this.salePointForm.getRawValue().createdDate,

        createdTime: this.salePointForm.getRawValue().createdTime,

        customerId: customer.id,

        customerName: customer.customerName,

        transactionCategory: category === 'RECEIVED' ? 'GIVEN' : 'RECEIVED',

        productType: `${this.selectedProductType}${productTypeLitreral}`,

        productId: this.selectedProduct?.id || 0,

        productDetails: this.getProductDetails(form, category),

        amount:
          entry.productType === 'PC'
            ? entry.differenceTotal
            : entry.productType === 'Ginni'
              ? entry.refiningTotal
              : entry.makingTotal,

        weight: 0,

        pureWeight: 0,

        report: 0,

        qty: 0,

        difference: entry.productType === 'PC' ? this.getDiff() : 0,
        differenceTotal:
          entry.productType === 'PC' ? this.getDiffTotal(form, category) : 0,
        making:
          entry.productType === 'Bar' || entry.productType === 'Coin'
            ? this.getMaking()
            : 0,
        makingTotal:
          entry.productType === 'Bar' || entry.productType === 'Coin'
            ? this.getMakingTotal(form, category)
            : 0,
        refining: entry.productType === 'Ginni' ? this.getRefining() : 0,
        refiningTotal:
          entry.productType === 'Ginni'
            ? this.getRefiningTotal(form, category)
            : 0,
        karat: 0,
        rate: 0,

        status: 'PENDING',
      };
      this.savedEntries.push(differenceEntry);
    }

    this._toast.success(
      `${this.selectedProductType} ${category.toLowerCase()} entry saved.`,
    );

    console.log('Saved Entry:', entry);

    console.log('All Saved Entries:', this.savedEntries);

    this.receivedForm.reset();
    this.givenForm.reset();
    this.setDefaultValuesForForms();
  }

  exportExcel() {
    if (this.saveEntry.length > 0) {
      const fileName = `customer_salepoint_entries ${this.savedEntries[0].referenceNo}`;
      const transFormData: any[] = this.savedEntries.map((item: any) => {
        const productDetails = item.productDetails || {};

        return {
          reference_no: item.referenceNo || '-',
          customer_name: item.customerName || '-',
          transaction_date: item.createdDate || '-',
          transaction_time: item.createdTime || '-',
          transaction_category: item.transactionCategory || '-',
          product_type: item.productType || '-',

          brand_name: productDetails.brandName || '-',
          sku_name: productDetails.skuName || '-',
          quantity: item.qty || 0,

          report: item.report || 0,
          karat: item.karat || 0,

          difference: item.difference || 0,
          difference_total: item.differenceTotal || 0,

          making_charges: item.making || 0,
          making_total: item.makingTotal || 0,

          refining_charges: item.refining || 0,
          refining_total: item.refiningTotal || 0,

          status: item.status || '-',
          buy_sell_rate: item.rate || 0,
          pure_weight: item.pureWeight || 0,
          weight: item.weight || 0,
          amount: item.amount || 0,
        };
      });

      transFormData.push(
        {
          reference_no: 'TOTAL RECEIVED',
          weight: this.totalReceivedWeight,
          amount: this.totalReceived,
        },
        {
          reference_no: 'TOTAL GIVEN',
          weight: this.totalGivenWeight,
          amount: this.totalGiven,
        },
        {
          reference_no: 'BALANCE',
          weight: this.totalReceivedWeight - this.totalGivenWeight,
          amount: this.totalReceived - this.totalGiven,
        },
      );

      this._helper.exportExcel(fileName, transFormData);
    } else {
      this._toast.error('Entries not found');
    }
  }

  /* =======================================================
     GET PRODUCT DETAILS
  ======================================================= */

  getProductDetails(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): any {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);

    switch (this.selectedProductType?.toUpperCase()) {
      /* ================= CASH ================= */

      case 'CASH':
        return {
          currency: data[`${prefix}Currency`],

          amount: Number(data[`${prefix}Amount`] || 0),

          weight: Number(data[`${prefix}Weight`] || 0),

          diff: Number(data[`${prefix}Diff`] || 0),

          diffAmount: Number(data[`${prefix}DiffAmount`] || 0),
        };

      /* ================= LAB ================= */

      case 'LAB':
        return {
          report: data[`${prefix}Report`],

          weight: Number(data[`${prefix}Weight`] || 0),

          pureWeight: Number(data[`${prefix}PureWeight`] || 0),

          totalAmount: Number(data[`${prefix}TotalAmount`] || 0),

          diff: Number(data[`${prefix}Diff`] || 0),

          diffAmount: Number(data[`${prefix}DiffAmount`] || 0),

          testingFeePW: Number(data[`${prefix}TestingFeePW`] || 0),

          testingFeeOA: Number(data[`${prefix}TestingFeeOA`] || 0),

          qty: Number(data[`${prefix}Qty`] || 0),
        };

      /* ================= PC ================= */

      case 'PC':
        return {
          brandId: data[`${prefix}BrandId`],

          brandName: this.getBrandName(data[`${prefix}BrandId`]),

          skuId: data[`${prefix}SkuId`],

          skuName: this.getSkuName(data[`${prefix}SkuId`]),

          weight: Number(data[`${prefix}Weight`] || 0),

          makingCharges: Number(data[`${prefix}MakingCharges`] || 0),

          qty: Number(data[`${prefix}Qty`] || 0),

          diff: Number(data[`${prefix}Diff`] || 0),

          diffAmount: Number(data[`${prefix}DiffAmount`] || 0),

          totalAmount: Number(data[`${prefix}TotalAmount`] || 0),
        };

      /* ================= BAR ================= */

      case 'BAR':
        return {
          brandId: data[`${prefix}BrandId`],

          brandName: this.getBrandName(data[`${prefix}BrandId`]),

          skuId: data[`${prefix}SkuId`],

          skuName: this.getSkuName(data[`${prefix}SkuId`]),

          weight: Number(data[`${prefix}Weight`] || 0),

          qty: Number(data[`${prefix}Qty`] || 0),

          making: Number(data[`${prefix}Making`] || 0),

          makingCharges: Number(data[`${prefix}MakingCharges`] || 0),

          diff: Number(data[`${prefix}Diff`] || 0),

          discount: Number(data[`${prefix}Discount`] || 0),

          totalAmount: Number(data[`${prefix}TotalAmount`] || 0),
        };

      /* ================= COIN ================= */

      case 'COIN':
        return {
          brandId: data[`${prefix}BrandId`],

          brandName: this.getBrandName(data[`${prefix}BrandId`]),

          skuId: data[`${prefix}SkuId`],

          skuName: this.getSkuName(data[`${prefix}SkuId`]),

          weight: Number(data[`${prefix}Weight`] || 0),

          qty: Number(data[`${prefix}Qty`] || 0),

          making: Number(data[`${prefix}Making`] || 0),

          karat: data[`${prefix}Karat`],

          pureWeight: Number(data[`${prefix}PureWeight`] || 0),

          diff: Number(data[`${prefix}Diff`] || 0),

          totalAmount: Number(data[`${prefix}TotalAmount`] || 0),
        };

      /* ================= GINNI ================= */

      case 'GINNI':
        return {
          ginniWeight: Number(data[`${prefix}Weight`] || 0),

          refiningCharges: Number(data[`${prefix}RefiningCharges`] || 0),

          report: data[`${prefix}Report`],

          pureWeight: Number(data[`${prefix}PureWeight`] || 0),

          totalAmount: Number(data[`${prefix}TotalAmount`] || 0),
        };

      /* ================= SILVER ================= */

      case 'SILVER':
        return {
          brandId: data[`${prefix}BrandId`],

          brandName: this.getBrandName(data[`${prefix}BrandId`]),

          skuId: data[`${prefix}SkuId`],

          skuName: this.getSkuName(data[`${prefix}SkuId`]),

          weight: Number(data[`${prefix}Weight`] || 0),

          qty: Number(data[`${prefix}Qty`] || 0),

          making: Number(data[`${prefix}Making`] || 0),

          makingPerUnit: Number(data[`${prefix}MakingPerUnit`] || 0),

          rawalRod: Number(data[`${prefix}RawalRod`] || 0),

          totalAmount: Number(data[`${prefix}TotalAmount`] || 0),

          totalWeight:
            Number(data[`${prefix}Weight`] || 0) *
            Number(data[`${prefix}Qty`] || 0),
        };

      default:
        return {};
    }
  }

  /* =======================================================
     CURRENT AMOUNT
  ======================================================= */

  getCurrentAmount(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): number {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);

    switch (this.selectedProductType?.toUpperCase()) {
      case 'CASH':
        return Number(data[`${prefix}Amount`] || 0);

      case 'LAB':
      case 'PC':
      case 'BAR':
      case 'COIN':
      case 'GINNI':
      case 'SILVER':
        return Number(data[`${prefix}TotalAmount`] || 0);

      default:
        return 0;
    }
  }

  /* =======================================================
     CURRENT WEIGHT
  ======================================================= */

  getCurrentWeight(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): number {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);

    switch (this.selectedProductType?.toUpperCase()) {
      case 'PC':
      case 'BAR':
      case 'COIN':
      case 'SILVER':
      case 'LAB':
      case 'GINNI':
      case 'CASH':
        return Number(data[`${prefix}Weight`] || 0);

      default:
        return 0;
    }
  }

  getPureWeight(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): number {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);

    switch (this.selectedProductType?.toUpperCase()) {
      case 'LAB':
      case 'GINNI':
      case 'COIN':
        return Number(data[`${prefix}PureWeight`] || 0);

      default:
        return 0;
    }
  }

  getReport(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): number {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);

    switch (this.selectedProductType?.toUpperCase()) {
      case 'LAB':
        return Number(data[`${prefix}Report`] || 0);

      case 'GINNI':
        return Number(data[`${prefix}Report`] || 0);

      default:
        return 0;
    }
  }

  getQty(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): number {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);

    switch (this.selectedProductType?.toUpperCase()) {
      case 'PC':
      case 'BAR':
      case 'COIN':
      case 'SILVER':
        return Number(data[`${prefix}Qty`] || 0);

      default:
        return 0;
    }
  }

  getDiff(): number {
    switch (this.selectedProductType?.toUpperCase()) {
      case 'PC':
      case 'CASH':
        return this.customer ? Number(this.customer.diffCharges || 0) : 0;

      default:
        return 0;
    }
  }

  getDiffTotal(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): number {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);

    switch (this.selectedProductType?.toUpperCase()) {
      case 'PC':
      case 'CASH':
        return Number(data[`${prefix}Diff`] || 0);
      default:
        return 0;
    }
  }

  getMaking(): number {
    switch (this.selectedProductType?.toUpperCase()) {
      case 'BAR':
      case 'COIN':
        return Number(
          (this.selectedSku?.makings.length ?? 0) > 0
            ? this.selectedSku?.makings[0].makingCharges
            : 0,
        );

      default:
        return 0;
    }
  }

  getMakingTotal(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): number {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);

    switch (this.selectedProductType?.toUpperCase()) {
      case 'BAR':
      case 'COIN':
        return Number(data[`${prefix}Making`] || 0);
      default:
        return 0;
    }
  }

  getKarat(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): number {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);
    switch (this.selectedProductType?.toUpperCase()) {
      case 'COIN':
        return Number(data[`${prefix}Karat`] || 0);

      default:
        return 0;
    }
  }

  getRefining(): number {
    switch (this.selectedProductType?.toUpperCase()) {
      case 'GINNI':
        return this.customer ? Number(this.customer.refineCharges || 0) : 0;

      default:
        return 0;
    }
  }

  getRefiningTotal(form: FormGroup, category: 'RECEIVED' | 'GIVEN'): number {
    const data = form.getRawValue();

    const prefix = this.getSectionPrefix(category);

    switch (this.selectedProductType?.toUpperCase()) {
      case 'GINNI':
        return Number(data[`${prefix}RefiningCharges`] || 0);
      default:
        return 0;
    }
  }

  /* =======================================================
     GET BRAND NAME
  ======================================================= */

  getBrandName(brandId: number | string | null): string {
    if (brandId === null || brandId === undefined || brandId === '') {
      return '';
    }

    const brand = this.productBrands.find(
      (item) => item.id === Number(brandId),
    );

    return brand?.name || '';
  }

  /* =======================================================
     GET SKU NAME
  ======================================================= */

  getSkuName(skuId: number | string | null): string {
    if (skuId === null || skuId === undefined || skuId === '') {
      return '';
    }

    const sku = this.productSkus.find((item) => item.id === Number(skuId));

    return sku?.name || '';
  }

  /* =======================================================
     SUBMIT ALL SAVED ENTRIES
  ======================================================= */

  submitEntries(): void {
    this.clearMessages();

    if (this.savedEntries.length === 0) {
      this._toast.error('Please save at least one entry before submitting.');

      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const transactionInfo = this.salePointForm.getRawValue();

    const payload = {
      referenceNo: transactionInfo.referenceNo,

      createdDate: transactionInfo.createdDate,

      createdTime: transactionInfo.createdTime,

      customerId: transactionInfo.customerId,

      entries: this.savedEntries.map((entry) => ({
        transactionCategory: entry.transactionCategory,

        productId: entry.productId,

        productType: entry.productType,

        productDetails: entry.productDetails,

        amount: entry.amount,

        weight: entry.weight,
      })),
    };

    console.log('SUBMIT TRANSACTION PAYLOAD:', payload);

    this._toast.success('Transaction ready for API submission.');

    this.isSubmitting = false;
  }

  /* =======================================================
     RESET PRODUCT SELECTION
  ======================================================= */

  resetProductSelection(): void {
    this.selectedProduct = null;

    this.selectedProductType = '';

    this.selectedBrand = null;

    this.selectedSku = null;

    this.selectedMaking = null;

    this.filteredBrands = [];

    this.filteredSkus = [];

    this.filteredMakings = [];

    this.receivedForm.reset({
      receivedCashCurrency: 'PKR',
    });

    this.givenForm.reset({
      givenCashCurrency: 'PKR',
    });
  }

  /* =======================================================
     RESET COMPLETE TRANSACTION
  ======================================================= */

  resetTransaction(): void {
    const customerId = this.salePointForm.get('customerId')?.value;

    this.createForms();

    this.salePointForm.patchValue({
      customerId: customerId,
    });

    this.resetProductSelection();
  }

  /* =======================================================
     REMOVE SAVED ENTRY
  ======================================================= */

  removeEntry(localId: number): void {
    this.savedEntries = this.savedEntries.filter(
      (entry) => entry.localId !== localId,
    );
  }

  /* =======================================================
     RECEIVED TOTAL
  ======================================================= */

  get totalReceived(): number {
    return this.savedEntries
      .filter((entry) => entry.transactionCategory === 'RECEIVED')
      .reduce((total, entry) => total + entry.amount, 0);
  }

  /* =======================================================
     GIVEN TOTAL
  ======================================================= */

  get totalGiven(): number {
    return this.savedEntries
      .filter((entry) => entry.transactionCategory === 'GIVEN')
      .reduce((total, entry) => total + entry.amount, 0);
  }

  /* =======================================================
     RECEIVED WEIGHT
  ======================================================= */

  get totalReceivedWeight(): number {
    return this.savedEntries
      .filter((entry) => entry.transactionCategory === 'RECEIVED')
      .reduce(
        (total, entry) =>
          total +
          (['COIN', 'LAB', 'GINNI'].includes(entry.productType.toUpperCase())
            ? Number(entry.pureWeight) || 0
            : (['BAR'].includes(entry.productType.toUpperCase())
                ? Number(entry.qty) || 0
                : 1) * (Number(entry.weight) || 0)),
        0,
      );
  }

  /* =======================================================
     GIVEN WEIGHT
  ======================================================= */

  get totalGivenWeight(): number {
    return this.savedEntries
      .filter((entry) => entry.transactionCategory === 'GIVEN')
      .reduce(
        (total, entry) =>
          total +
          (['COIN', 'LAB', 'GINNI'].includes(entry.productType.toUpperCase())
            ? Number(entry.pureWeight) || 0
            : (['BAR'].includes(entry.productType.toUpperCase())
                ? Number(entry.qty) || 0
                : 1) * (Number(entry.weight) || 0)),
        0,
      );
  }

  /* =======================================================
     BALANCE
  ======================================================= */

  get balance(): number {
    return this.totalReceived - this.totalGiven;
  }

  /* =======================================================
     WEIGHT BALANCE
  ======================================================= */

  get weightBalance(): number {
    return this.totalReceivedWeight - this.totalGivenWeight;
  }

  /* =======================================================
     CURRENT DATE
  ======================================================= */

  getCurrentDate(): string {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /* =======================================================
     CURRENT TIME
  ======================================================= */

  getCurrentTime(): string {
    const date = new Date();

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /* =======================================================
     GENERATE REFERENCE NUMBER
  ======================================================= */

  generateReferenceNo(): string {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    const random = Math.floor(10000 + Math.random() * 90000);

    return `SP-${year}${month}${day}-${random}`;
  }

  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  clearMessages(): void {
    this.successMessage = '';

    this.errorMessage = '';
  }

  getEntryWeightMarkup(entry: any): number {
    const productType = entry.productType?.toUpperCase();

    if (productType === 'BAR') {
      return (Number(entry.qty) || 0) * (Number(entry.weight) || 0);
    }

    if (['COIN', 'LAB', 'GINNI'].includes(productType)) {
      return Number(entry.pureWeight) || 0;
    }

    return Number(entry.weight) || 0;
  }

  getProductType(entry: any): string {
    const productType = entry.productType?.toUpperCase();

    if (['COIN', 'BAR', 'PC'].includes(productType)) {
      return `${entry.productDetails?.brandName} ${entry.productDetails?.skuName} ${entry.productType} x${entry.qty}`;
    }

    return entry.productType;
  }

  openGoldReport(customerData: any): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/kw-gold-report'], {
        queryParams: {
          data: JSON.stringify(customerData),
        },
      }),
    );

    window.open(
      this.location.prepareExternalUrl(url),
      '_blank',
      'noopener,noreferrer',
    );
  }

  viewReport(category: 'RECEIVED' | 'GIVEN') {
    const customer = this.selectedCustomer;

    if (!customer) {
      this._toast.error('Please select a customer.');

      return;
    }
    const form = category === 'RECEIVED' ? this.receivedForm : this.givenForm;

    const customerData = {
      reportDate: this.salePointForm.getRawValue().createdDate,
      referenceNo: this.salePointForm.getRawValue().referenceNo,
      customer: {
        customerName: customer?.customerName,
        customerContact: customer?.primaryPhone,
        customerCNIC: customer?.cnic,
      },
      lab: {
        weight: this.getCurrentWeight(form, category),
        pureWeight: this.getPureWeight(form, category),
        report: this.getReport(form, category),
      },
    };

    this.openGoldReport(customerData);
  }
}
