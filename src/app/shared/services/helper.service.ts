import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { BehaviorSubject } from 'rxjs';

export interface keys {
  key: string;
  childKey?: string;
}

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor() {}

  messageSource = new BehaviorSubject('');
  objectSource = new BehaviorSubject('{}');

  currentMsg = this.messageSource.asObservable();
  currentObj = this.objectSource.asObservable();

  changMsg(msg: string) {
    this.messageSource.next(msg);
  }

  changObj(obj: any) {
    let OBJ = JSON.stringify(obj);
    this.objectSource.next(OBJ);
  }

  arrayToString(arr: any[], key?: string): string {
    let cont = '';
    arr.map((res) => {
      if (key) {
        cont += res[key] + ', ';
      } else {
        cont += res + ', ';
      }
    });
    return cont;
  }

  exportExcel(fileName: any, src: any, keys?: keys[]) {
    if (src.length > 0) {
      import('xlsx').then((xlsx) => {
        let data = [];
        data = [...src];
        // change kye array values type array to string
        if (keys) {
          data.map((res) => {
            keys.forEach((item) => {
              if (item.childKey) {
                res[item.key] = this.arrayToString(
                  res[item.key],
                  item.childKey
                );
              } else {
                res[item.key] = this.arrayToString(res[item.key]);
              }
            });
          });
        }
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        this.saveAsExcelFile(excelBuffer, fileName);
      });
    }
  }
  
  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      fileName + '_export_excel_' + new Date().toLocaleDateString()
    );
  }
}
