import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { ArchwizardModule } from 'angular-archwizard';
import { AuthRoutingModule } from './auth-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { SharedModule } from '../../shared/shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.default
};

@NgModule({
  declarations: [LoginComponent, ForgotPasswordComponent],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgWizardModule.forRoot(ngWizardConfig),

    // ArchwizardModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    NgbModule,
    CommonModule,
    NgSelectModule,
    AuthRoutingModule,
    SharedModule,
  ],
})
export class AuthModule { }
