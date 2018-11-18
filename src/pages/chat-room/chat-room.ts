import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';


@IonicPage()
@Component({
  selector: 'page-chat-room',
  templateUrl: 'chat-room.html',
})
export class ChatRoomPage {
  messages = [];
  nickname = '';
  message = '';
  constructor(
    private navCtrl: NavController, 
    private navParams: NavParams, private socket: Socket,
    private toastCtrl: ToastController
  ) {
    this.socket.connect();
    this.nickname = this.navParams.get('nickname');
    if(this.nickname == "" || this.nickname == 'undefined'){
      this.navCtrl.popToRoot();
    }
 
    this.getMessages().subscribe(message => {
      this.messages.push(message);
    });
 
    this.getUsers().subscribe(data => {
      let user = data['username'];
      if (data['event'] === 'left') {
        this.showToast('User left: ' + user);
      } else {
        this.showToast('User joined: ' + user);
      }
    });

    this.socket.on('reconnect_error', () => { 
    
    });


  }
 
  sendMessage() {
    this.socket.emit('new message', this.message);
    this.messages.push({
        username: this.nickname,
        message: this.message
      });
    this.message = '';
  }
 
  getMessages() {
    let observable = new Observable(observer => {
      this.socket.on('new message', (data) => { 
        observer.next(data);
      });
    })
    return observable;
  }
 
  


  getUsers() {
    let observable = new Observable(observer => {
      this.socket.on('user joined', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }
 
  ionViewWillLeave() {
    this.socket.disconnect();
  }
 
  showToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatRoomPage');
  }

}
