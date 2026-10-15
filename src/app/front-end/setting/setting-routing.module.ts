import { ChangePasswordComponent } from './change-password/change-password.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { AddNewUserComponent } from './add-new-user/add-new-user.component';
import { ProductManagementComponent } from './product-management/product-management.component';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { CustomersComponent } from './customers/customers.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'emails',
        pathMatch: 'full',
      },
      {
        path: 'change_password',
        component: ChangePasswordComponent,
        title: 'Change password',
      },
      {
        path: 'users/all',
        component: UsersComponent,
        title: 'Users',
      },
      {
        path: 'add_new_user',
        component: AddNewUserComponent,
        title: 'Add New User',
      },
      {
        path: 'product_management',
        component: ProductManagementComponent,
        title: 'Product Management',
      },
      {
        path: 'add_customer',
        component: AddCustomerComponent,
        title: 'Add Customer'
      },
      {
        path: 'customers/all',
        component: CustomersComponent,
        title: 'Customers'
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingRoutingModule {}
