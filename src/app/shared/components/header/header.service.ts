import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  notification = new Subject<any>();

  refresh = new Subject<any>();

  constructor() { }
}
