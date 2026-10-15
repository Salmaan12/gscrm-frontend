import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableSortingService {

  constructor() { }

  sortTable(data, column, order) {
    var array = data
    if (order == 'asending') {
      array.sort((a, b) => (a[column] == null ? '' : a[column].toString()).localeCompare(b[column] == null ? '' : b[column].toString()));
    } else {
      array.sort((a, b) => (b[column] == null ? '' : b[column].toString()).localeCompare(a[column] == null ? '' : a[column].toString()));

    }

    // console.log(array);
  }
}
