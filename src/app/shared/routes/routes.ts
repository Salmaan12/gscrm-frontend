
import { DashboardModule } from './../../front-end/dashboard/dashboard.module';
import { Routes } from '@angular/router';


export const content: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('../../front-end/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'salepoint',
    loadChildren: () => import('../../front-end/sale-point/sale-point.module').then(m => m.SalePointModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('../../front-end/setting/setting.module').then(m => m.SettingModule)
  }
];
