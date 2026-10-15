import { environment } from '../../../environments/environment';

export class ApiLinks {
  readonly baseUrl = environment.baseUrl;

  // Users
  readonly changeUserPassword = this.baseUrl + 'users/change-password';
  readonly userLogin = this.baseUrl + 'users/authenticate';
  readonly getAllUserList = this.baseUrl + 'users/all';
  readonly createUser = this.baseUrl + 'users/create';
  readonly updateUser = this.baseUrl + 'users/update/';

  //Products
  readonly getAllProducts = this.baseUrl + 'products/getAllProductBrandSKUs';
  readonly createProduct = this.baseUrl + 'products/createproduct';
  readonly updateProduct =  this.baseUrl + 'products/updateproduct/';
  readonly createBrand = this.baseUrl + 'products/createbrand';
  readonly updateBrand = this.baseUrl + 'products/updatebrand/';
  readonly createBrandSku = this.baseUrl + 'products/createbrandsku';
  readonly updateBrandSku = this.baseUrl + 'products/updatebrandsku/';

  readonly getAllCustomerList = this.baseUrl + 'customers/all';
  readonly getAllCustomerWithPagination = this.baseUrl + 'customers/all/';
  readonly createCustomer = this.baseUrl + 'customers/create';
  readonly updateCustomer = this.baseUrl + 'customers/update/';
}
