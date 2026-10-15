import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavService } from '../../services/nav.service';
import { LayoutService } from '../../services/layout.service';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService } from '../../services/api.service';
// import { ToastrService } from 'ngx-toastr';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public elem: any;
  public dark: boolean =
  this.layout.config.settings.layout_version == 'dark-only' ? true : false;
  notifications!: any[];
  taskId: any;
  level: any;
  currentDateTime = new Date();
  private intervalId!: ReturnType<typeof setInterval>;

  constructor(
    @Inject(HeaderService) private _headerService: HeaderService,
    public layout: LayoutService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private api_service: ApiService,
    // private toast: ToastrService,
    public navServices: NavService,
    @Inject(DOCUMENT) private document: any
  ) {}

  ngOnInit() {
    // this._connect();
    this.elem = document.documentElement;
    this.intervalId = setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);
  }

  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
    this.navServices.megaMenu = false;
    this.navServices.levelMenu = false;
  }
  layoutToggle() {
    this.dark = !this.dark;
    this.layout.config.settings.layout_version = this.dark
      ? 'dark-only'
      : 'light';
  }

  searchToggle() {
    this.navServices.search = true;
  }

  languageToggle() {
    this.navServices.language = !this.navServices.language;
  }

  toggleFullScreen() {
    this.navServices.fullScreen = !this.navServices.fullScreen;
    if (this.navServices.fullScreen) {
      if (this.elem.requestFullscreen) {
        this.elem.requestFullscreen();
      } else if (this.elem.mozRequestFullScreen) {
        /* Firefox */
        this.elem.mozRequestFullScreen();
      } else if (this.elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.elem.webkitRequestFullscreen();
      } else if (this.elem.msRequestFullscreen) {
        /* IE/Edge */
        this.elem.msRequestFullscreen();
      }
    } else {
      if (!this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

}

/* =====================] */
