import { forwardRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UsersComponent } from './users/users.component';
import { AddNewUserComponent } from './add-new-user/add-new-user.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ProductManagementComponent } from './product-management/product-management.component';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { CustomersComponent } from './customers/customers.component';

@NgModule({
  declarations: [
    ChangePasswordComponent,
    UsersComponent,
    AddNewUserComponent,
    ProductManagementComponent,
    AddCustomerComponent,
    CustomersComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    SharedModule,
    AngularEditorModule,
  ],
})
export class SettingModule {}
