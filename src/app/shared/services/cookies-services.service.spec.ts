/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CookiesServicesService } from './cookies-services.service';

describe('Service: CookiesServices', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CookiesServicesService]
    });
  });

  it('should ...', inject([CookiesServicesService], (service: CookiesServicesService) => {
    expect(service).toBeTruthy();
  }));
});
