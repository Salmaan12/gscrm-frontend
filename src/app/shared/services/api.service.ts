import { CookiesServicesService } from './cookies-services.service';
import { ApiLinks } from '../data/apiLinks';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  userId: any;
  constructor(
    private _apilink: ApiLinks,
    private http: HttpClient,
    private cookiesServicesService: CookiesServicesService,
  ) {}

  getHeaders() {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return headers;
  }

  getAuthToken() {
    let auth_token: any = this.cookiesServicesService.getCookie('auth_token');
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + auth_token);
    return headers;
  }

  userLogin(data: any) {
    // let headers = this.getHeaders();
    return this.http.post(this._apilink.userLogin, data);
  }

  changeUserPassword(data: any) {
    let headers = this.getHeaders();
    return this.http.put(this._apilink.changeUserPassword, data, { headers });
  }

  getUsers() {
    let headers = this.getAuthToken();
    return this.http.get(this._apilink.getAllUserList, { headers });
  }

  createUser(data: any) {
    let headers = this.getAuthToken();
    return this.http.post(this._apilink.createUser, data, { headers });
  }

  updateUser(userId: any, data: any) {
    let headers = this.getAuthToken();
    return this.http.put(this._apilink.updateUser + userId, data, { headers });
  }

  getAllProductsWithBrandsAndSku() {
    let headers = this.getAuthToken();
    return this.http.get(this._apilink.getAllProducts, { headers });
  }

  createProduct(data: any) {
    let headers = this.getAuthToken();
    return this.http.post(this._apilink.createProduct, data, { headers });
  }

  updateProduct(data: any, productId: any) {
    let headers = this.getAuthToken();
    return this.http.post(this._apilink.updateProduct + productId, data, {
      headers,
    });
  }

  createBrand(data: any) {
    let headers = this.getAuthToken();
    return this.http.post(this._apilink.createBrand, data, { headers });
  }

  updateBrand(data: any, brandId: any) {
    let headers = this.getAuthToken();
    return this.http.post(this._apilink.updateBrand + brandId, data, {
      headers,
    });
  }

  createBrandSKU(data: any) {
    let headers = this.getAuthToken();
    return this.http.post(this._apilink.createBrandSku, data, { headers });
  }

  updateBrandSKU(data: any, brandSkuId: any) {
    let headers = this.getAuthToken();
    return this.http.post(this._apilink.updateBrandSku + brandSkuId, data, {
      headers,
    });
  }

  getAllCustomerList() {
    let headers = this.getAuthToken();
    return this.http.get(this._apilink.getAllCustomerList, { headers });
  }

  getAllCustomersWithPagination(config: any) {
    let headers = this.getAuthToken();
    return this.http.get(
      this._apilink.getAllCustomerWithPagination +
        'pagination?page=' +
        config.page +
        '&pageSize=' +
        config.pageSize +
        '&searchStr=' +
        config.searchStr,
      { headers },
    );
  }

  createCustomer(data: any) {
    let headers = this.getAuthToken();
    return this.http.post(this._apilink.createCustomer, data, { headers });
  }

  updateCustomer(customerId: any, data: any) {
    let headers = this.getAuthToken();
    return this.http.put(this._apilink.updateCustomer + customerId, data, {
      headers,
    });
  }
}
