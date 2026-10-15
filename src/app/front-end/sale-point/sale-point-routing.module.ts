import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { SalePointComponent } from './sale-point.component';

const routes: Routes = [
    {
        path: 'create',
        component: SalePointComponent,
        title: 'Sale Point'
    },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SalePointRoutingModule { }
