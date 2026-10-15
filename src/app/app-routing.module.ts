import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentComponent } from './shared/components/layout/content/content.component';
import {KwGoldReportComponent} from './front-end/labGinniReport/kw-gold-report.component'
import { FullComponent } from './shared/components/layout/full/full.component';
import { AdminGuard } from './shared/guard/admin.guard';
import { full } from './shared/routes/full.routes';
import { content } from './shared/routes/routes';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
    title: '',
  },
  {
    path: 'kw-gold-report',
    component: KwGoldReportComponent,
  },
  {
    path: '',
    component: ContentComponent,
    canActivate: [AdminGuard],
    children: content,
    title: 'Admin',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./front-end/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    [
      RouterModule.forRoot(routes, {
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ],
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
