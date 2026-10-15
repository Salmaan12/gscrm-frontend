import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { error } from 'console';
import { ToastrService } from 'ngx-toastr';


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

interface ProductBrandSku {
  id: number;
  productBrandId: number;
  name: string;
  weightInGM: string;
  makings: Makings[];
  isActive: boolean;
}

interface Makings {
  id: number,
  makingCharges: string
}

interface ProductListResponse {
  code: number;
  message: string;
  data: {
    products: Product[];
    brands: ProductBrand[];
    skus: ProductBrandSku[];
  };
}


@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {

  constructor(
    private _apiService: ApiService,
    private _loaderService: NgxUiLoaderService,
    private _toast: ToastrService
  ) { }


  ngOnInit(): void {
    this.getAllProducts();
  }

  activeTab: 'products' | 'brands' | 'skus' = 'products';

  products: Product[] = [];
  brands: ProductBrand[] = [];
  skus: ProductBrandSku[] = [];
  filteredBrands: ProductBrand[] = [];
  selectedProductId: number | null = null;
  selectedBrandId: number | null = null;
  showModal = false;
  modalType: 'product' | 'brand' | 'sku' = 'product';
  modalMode: 'add' | 'edit' = 'add';

  productForm: Product = {
    id: 0,
    name: '',
    type: '',
    isActive: true
  };


  brandForm: ProductBrand = {
    id: 0,
    productId: 0,
    name: '',
    isActive: true
  };


  skuForm: ProductBrandSku = {
    id: 0,
    productBrandId: 0,
    name: '',
    weightInGM: '',
    makings: [],
    isActive: true
  };

  get selectedProduct(): Product | undefined {
    if (this.selectedProductId === null) {
      return undefined;
    }
    return this.products.find(
      x => x.id === this.selectedProductId
    );
  }

  get selectedBrand(): ProductBrand | undefined {
    if (this.selectedBrandId === null) {
      return undefined;
    }
    return this.brands.find(
      x => x.id === this.selectedBrandId
    );
  }

  get filteredSkus(): ProductBrandSku[] {
    if (this.selectedBrandId === null) {
      return [];
    }
    return this.skus.filter(
      x => x.productBrandId === this.selectedBrandId
    );
  }

  getBrandCount(productId: number): number {
    return this.brands.filter(
      brand => brand.productId === productId
    ).length;
  }

  getSkuCount(brandId: number): number {
    return this.skus.filter(
      sku => sku.productBrandId === brandId
    ).length;
  }

  getAllProducts(): void {

    try {
      this._loaderService.startLoader('loader-02');
      this._apiService.getAllProductsWithBrandsAndSku().subscribe((res: ProductListResponse | any) => {
        if (res?.code === 200 && res?.data) {
          this.products = res.data.products || [];
          this.brands = res.data.brands || [];
          this.skus = res.data.skus || [];

          if (this.products.length > 0) {

            const productExists = this.products.some(
              product => product.id === this.selectedProductId
            );

            if (!productExists) {
              this.selectedProductId = this.products[0].id;
            }
          } else {
            this.selectedProductId = null;
          }

          this.updateFilteredBrands();

          if (this.selectedProductId !== null) {

            const productBrands = this.brands.filter(
              brand => brand.productId === this.selectedProductId
            );

            const brandExists = productBrands.some(
              brand => brand.id === this.selectedBrandId
            );

            if (!brandExists) {

              this.selectedBrandId =
                productBrands.length > 0
                  ? productBrands[0].id
                  : null;

            }

          }
          else {

            this.selectedBrandId = null;

          }
          // this._toast.success('Product retrieve successfully')
          this._loaderService.stopLoader('loader-02');
        }
      });
    } catch (error: any) {
      this._loaderService.stopLoader('loader-02');
      this._toast.error('Error loading product:', error);
    }
  }

  openTab(
    tab: 'products' | 'brands' | 'skus'
  ): void {
    this.activeTab = tab;
  }

  selectProduct(productId: number): void {
    this.selectedProductId = productId;
    this.updateFilteredBrands();

    const firstBrand = this.brands.find(
      brand => brand.productId === productId
    );
    if (firstBrand) {
      this.selectedBrandId = firstBrand.id;
    } else {
      this.selectedBrandId = null;
    }
  }

  selectBrand(brandId: number): void {
    this.selectedBrandId = brandId;
  }

  private updateFilteredBrands(): void {
    this.filteredBrands = this.selectedProductId === null
      ? []
      : this.brands.filter(
        brand => brand.productId === this.selectedProductId
      );
  }

  addProduct(): void {
    this.modalType = 'product';
    this.modalMode = 'add';
    this.productForm = {
      id: 0,
      name: '',
      type: '',
      isActive: true
    };
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.modalType = 'product';
    this.modalMode = 'edit';
    this.productForm = {
      ...product
    };
    this.showModal = true;
  }

  addBrand(): void {
    this.modalType = 'brand';
    this.modalMode = 'add';
    this.brandForm = {
      id: 0,
      productId: this.selectedProductId ?? 0,
      name: '',
      isActive: true
    };
    this.showModal = true;
  }


  editBrand(brand: ProductBrand): void {
    this.modalType = 'brand';
    this.modalMode = 'edit';
    this.brandForm = {
      ...brand
    };
    this.showModal = true;
  }

  addSku(): void {
    this.modalType = 'sku';
    this.modalMode = 'add';
    this.skuForm = {
      id: 0,
      productBrandId: this.selectedBrandId ?? 0,
      name: '',
      weightInGM: '',
      isActive: true,
      makings: [
        {
          id: 0,
          makingCharges: ''
        }
      ]
    };
    this.showModal = true;
  }


  editSku(sku: ProductBrandSku): void {
    this.modalType = 'sku';
    this.modalMode = 'edit';
    this.skuForm = {
      ...sku
    };
    this.showModal = true;
  }

  save(): void {
    if (this.modalType === 'product') {
      this.saveProduct();
      return;
    }


    if (this.modalType === 'brand') {
      this.saveBrand();
      return;
    }

    if (this.modalType === 'sku') {
      this.saveSku();
      return;
    }
  }


  saveProduct(): void {
    if (!this.productForm.name.trim()) {
      this._toast.error('Enter Product Name');
      return;
    }

    if (this.modalMode === 'add') {

      const payload = {
        name: this.productForm.name.trim(),
        type: this.productForm.type,
        IsActive: this.productForm.isActive
      };


      this._loaderService.startLoader('loader-02');

      this._apiService.createProduct(payload).subscribe(() => {
        this._toast.success('Product added successfully');
        this._loaderService.stopLoader('loader-02');
        this.closeModal();
        this.getAllProducts();
      }, (error) => {
        this._loaderService.stopLoader('loader-02');
        this._toast.error(error?.error?.message || 'Error adding product');
      });

    } else {

      const payload = {
        name: this.productForm.name.trim(),
        type: this.productForm.type,
        IsActive: this.productForm.isActive
      };

      this._loaderService.startLoader('loader-02');


      this._apiService.updateProduct(payload,this.productForm.id).subscribe(() => {
        this._toast.success(`${this.productForm.name.trim()} product updated successfully`);
        this._loaderService.stopLoader('loader-02');
        this.closeModal();
        this.getAllProducts();
      }, (error) => {
        this._loaderService.stopLoader('loader-02');
        this._toast.error(error?.error?.message || 'Error adding product');
      });

    }
  }

  saveBrand(): void {
    if (!this.brandForm.name.trim()) {
      this._toast.error('Enter Brand Name');
      return;
    }

    if (!this.brandForm.productId) {
      this._toast.error('Select Product');
      return;
    }

    if (this.modalMode === 'add') {

      const payload = {
        productId: this.brandForm.productId,
        name: this.brandForm.name.trim(),
        IsActive: this.brandForm.isActive
      };

      this._loaderService.startLoader('loader-02');


      this._apiService.createBrand(payload).subscribe(() => {
        this._toast.success('Brand added successfully');
        this._loaderService.stopLoader('loader-02');
        this.closeModal();
        this.getAllProducts();
      }, (error) => {
        this._loaderService.stopLoader('loader-02');
        this._toast.error(error?.error?.message || 'Error adding brand');
      });

    } else {

      const payload = {
        productId: this.brandForm.productId,
        name: this.brandForm.name.trim(),
        IsActive: this.brandForm.isActive
      };

      this._loaderService.startLoader('loader-02');

      this._apiService.updateBrand(payload,this.brandForm.id).subscribe(() => {
        this._toast.success(`${this.brandForm.name.trim()} brand updated successfully`);
        this._loaderService.stopLoader('loader-02');
        this.closeModal();
        this.getAllProducts();
      }, (error) => {
        this._loaderService.stopLoader('loader-02');
        this._toast.error(error?.error?.message || 'Error adding brand');
      });

    }
  }

  saveSku(): void {
    if (!this.skuForm.name.trim()) {
      this._toast.error('Enter Brand Name');
      return;
    }

    if (!this.skuForm.productBrandId) {
      this._toast.error('Select Brand');
      return;
    }

    if (this.modalMode === 'add') {

      const payload = {
        productBrandId: this.skuForm.productBrandId,
        name: this.skuForm.name.trim(),
        weightInGM: this.skuForm.weightInGM,
        IsActive: this.brandForm.isActive,
        makingCharges: this.skuForm.makings.map(making => (making.makingCharges))
      };

      this._loaderService.startLoader('loader-02');


      this._apiService.createBrandSKU(payload).subscribe(() => {
        this._toast.success('Brand SKU added successfully');
        this._loaderService.stopLoader('loader-02');
        this.closeModal();
        this.getAllProducts();
      }, (error) => {
        this._loaderService.stopLoader('loader-02');
        this._toast.error(error?.error?.message || 'Error adding brand sku');
      });

    } else {

      const payload = {
        productBrandId: this.skuForm.productBrandId,
        name: this.skuForm.name.trim(),
        weightInGM: this.skuForm.weightInGM,
        IsActive: this.brandForm.isActive,
        makingCharges: this.skuForm.makings.map(making => (making.makingCharges))
      };

      this._loaderService.startLoader('loader-02');

      this._apiService.updateBrandSKU(payload, this.skuForm.id).subscribe(() => {
        this._toast.success(`${this.brandForm.name.trim()} brand SKU updated successfully`);
        this._loaderService.stopLoader('loader-02');
        this.closeModal();
        this.getAllProducts();
      }, (error) => {
        this._loaderService.stopLoader('loader-02');
        this._toast.error(error?.error?.message || 'Error adding brand sku');
      });

    }

  }

  closeModal(): void {
    this.showModal = false;
  }

}