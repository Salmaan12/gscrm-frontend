import { TableSortingService } from './services/table-sorting.service';
import { HeaderService } from './components/header/header.service';
import { WebsocketService } from './services/websocket.service';
import { ApiLinks } from './data/apiLinks';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './services/api.service';
import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
// import {
//   CUSTOM_ELEMENTS_SCHEMA,
//   NgModule,
//   NO_ERRORS_SCHEMA,
// } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  DropzoneConfigInterface,
  DropzoneModule,
  DROPZONE_CONFIG,
} from 'ngx-dropzone-wrapper';
import { Ng2SearchPipeModule } from '@ngx-maintenance/ng2-search-filter';

// Components
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { FeatherIconsComponent } from './components/feather-icons/feather-icons.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/layout/content/content.component';
import { FullComponent } from './components/layout/full/full.component';
import { LoaderComponent } from './components/loader/loader.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TapToTopComponent } from './components/tap-to-top/tap-to-top.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
// Header Elements Components
import { SearchComponent } from './components/header/elements/search/search.component';
import { MegaMenuComponent } from './components/header/elements/mega-menu/mega-menu.component';
import { LanguagesComponent } from './components/header/elements/languages/languages.component';
import { BookmarkComponent } from './components/header/elements/bookmark/bookmark.component';
import { CartComponent } from './components/header/elements/cart/cart.component';
import { MessageBoxComponent } from './components/header/elements/message-box/message-box.component';
// Directives
import { DisableKeyPressDirective } from './directives/disable-key-press.directive';
import { OnlyAlphabetsDirective } from './directives/only-alphabets.directive';
import { OnlyNumbersDirective } from './directives/only-numbers.directive';
import { ShowOptionsDirective } from './directives/show-options.directive';
import { FreeDraggingDirective } from './directives/free-dragging.directive';
// Service
import { LayoutService } from './services/layout.service';
import { NavService } from './services/nav.service';
import { FreeDraggingHandleDirective } from './directives/free-dragging-handle.directive';
import { HelperService } from './services/helper.service';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MyAccountComponent } from './components/header/elements/my-account/my-account.component';
import { KwGoldReportComponent } from '../front-end/labGinniReport/kw-gold-report.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: 'https://httpbin.org/post',
  acceptedFiles: 'image/*',
  createImageThumbnails: true,
};
@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    FileUploaderComponent,
    SidebarComponent,
    ContentComponent,
    MyAccountComponent,
    BreadcrumbComponent,
    FeatherIconsComponent,
    FullComponent,
    ShowOptionsDirective,
    DisableKeyPressDirective,
    OnlyAlphabetsDirective,
    OnlyNumbersDirective,
    FreeDraggingHandleDirective,
    FreeDraggingDirective,
    LoaderComponent,
    TapToTopComponent,
    SearchComponent,
    MegaMenuComponent,
    LanguagesComponent,
    BookmarkComponent,
    CartComponent,
    MessageBoxComponent,
    KwGoldReportComponent
  ],
  imports: [
    // AngularFireModule.initializeApp(environment.firebase ),
    NgbPaginationModule,
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    // SweetAlert2Module,
    NgSelectModule,
    // NgxDropzoneModule,
    DropzoneModule,
    // NgxDocViewerModule,
    NgbModule,
    Ng2SearchPipeModule,
    // DragulaModule.forRoot(),
    TranslateModule,
    NgxUiLoaderModule,
    DatePipe
  ],
  exports: [
    // AngularFireModule.initializeApp(environment.firebase),
    HttpClientModule,
    NgbModule,
    FormsModule,
    // NgxDocViewerModule,
    Ng2SearchPipeModule,
    NgSelectModule,
    ReactiveFormsModule,
    // TranslateModule,
    // SweetAlert2Module,
    LoaderComponent,
    BreadcrumbComponent,
    FileUploaderComponent,
    FeatherIconsComponent,
    TapToTopComponent,
    // NgxDropzoneModule,
    DropzoneModule,
    DisableKeyPressDirective,
    OnlyAlphabetsDirective,
    OnlyNumbersDirective,
    FreeDraggingDirective,
    FreeDraggingHandleDirective,
    NgxUiLoaderModule,
  ],
  providers: [
    NavService,
    HeaderService,
    LayoutService,
    ApiService,
    WebsocketService,
    TableSortingService,
    ApiLinks,
    DatePipe,
    HelperService,
    // {
    //   provide: PERFECT_SCROLLBAR_CONFIG,
    //   useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    // },
    { provide: DROPZONE_CONFIG, useValue: DEFAULT_DROPZONE_CONFIG },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SharedModule {}
