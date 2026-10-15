import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { map, delay, withLatestFrom } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
declare var $:any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // For Progressbar
  loaders = this.loader.progress$.pipe(
    delay(1000),
    withLatestFrom(this.loader.progress$),
    map(v => v[1]),
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private loader: LoadingBarService, translate: TranslateService) {
    if (isPlatformBrowser(this.platformId)) {
      translate.setDefaultLang('en');
      translate.addLangs(['en', 'de', 'es', 'fr', 'pt', 'cn', 'ae']);
    }
    $(document).ready(function(){
      $(document).keydown(function(event) {
                if (event.ctrlKey==true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'  || event.which == '187'  || event.which == '189'  ) ) {

        event.preventDefault();
        // 107 Num Key  +
        //109 Num Key  -
        //173 Min Key  hyphen/underscor Hey
        // 61 Plus key  +/=
           }
      });

      $('body').bind('mousewheel DOMMouseScroll', function (event) {


        event.preventDefault();
             if (event.ctrlKey == true) {
             }
      });
    });
  }

}
