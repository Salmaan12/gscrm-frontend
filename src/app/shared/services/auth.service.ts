import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private data: any;

  // constructor(private http: HttpClient) {}

  // setData(value: any) {
  //   this.data = value;
  // }

  // getData() {
  //   console.log(this.data);
  //   return this.data;
  // }

  // clearData() {
  //   this.data = null;
  // }
  private storageKey = 'appData';

  setData(value: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(value));
  }

  getData() {
    const storedData = localStorage.getItem(this.storageKey);
    console.log({ storedData });
    return storedData ? JSON.parse(storedData) : null;
  }

  clearData() {
    localStorage.removeItem(this.storageKey);
  }
}
