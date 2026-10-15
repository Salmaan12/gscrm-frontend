import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

@Injectable()
export class WebsocketService {
  constructor() {}
  webSocketEndPoint: string = 'http://15.185.81.148:7777/ws';
  topic: string = '/topic/greetings';
  stompClient: any;
  ws: any = new SockJS(this.webSocketEndPoint);
  token: string =
    'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlzYWRtaW4iOnRydWUsImV4cCI6MTY0MDQyMjcyMCwiaWF0IjoxNjQwMTcwNzIwfQ.GDo0PO_hZK3lcbLoDvAjRacKBZXTqRyX3A_RQIzIw-J1eIVRVX_XlR1fiQ8Pyo_t4Nbud-z_ImYhCvPEC8595Q';

  _connect() {
    var token = 'ABC123';
    console.log('Initialize WebSocket Connection');
    this.stompClient = Stomp.over(this.ws);
    const _this = this;
    _this.stompClient.connect(
      { server: this.webSocketEndPoint },
      function (frame: any) {
        _this.stompClient.subscribe(_this.topic, function (sdkEvent: any) {
          _this.onMessageReceived(sdkEvent);
        });
        //_this.stompClient.reconnect_delay = 2000;
      },
      this.errorCallBack
    );
  }

  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log('Disconnected');
  }

  // on error, schedule a reconnection attempt
  errorCallBack(error: any) {
    console.log('errorCallBack -> ' + error);
    setTimeout(() => {
      this._connect();
    }, 5000);
  }

  /**
   * Send message to sever via web socket
   * @param {*} message
   */
  _send(message: any) {
    console.log('calling logout api via web socket');
    this.stompClient.send('/app/hello', {}, JSON.stringify(message));
  }

  onMessageReceived(message?: any) {
    this.stompClient.subscribe(this.topic, function (sdkEvent: any) {
      console.log('Message Recieved from Server :: ' + sdkEvent);
    });
  }
}
