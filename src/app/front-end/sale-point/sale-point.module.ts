import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalePointRoutingModule } from './sale-point-routing.module';
import { SalePointComponent } from './sale-point.component';
import { SharedModule } from '../../shared/shared.module';
import { ThermalPrintComponent } from './thermal-print/thermal-print.component';



@NgModule({
  declarations: [
    SalePointComponent,
    ThermalPrintComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SalePointRoutingModule
  ]
})
export class SalePointModule { }
