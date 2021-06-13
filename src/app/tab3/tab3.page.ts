import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  difficulties = ['easy', 'medium', 'hard'];

  constructor(private navCtrl: NavController, private alertCtrl: AlertController, private settings: SettingsService) { }

  ngOnInit() {
  }
  async openInfo(){
    let infoScreen = await this.alertCtrl.create({
      message: this.settings.lang.setting_info,
      buttons: [
        {
          text: this.settings.lang.close
        }
      ],
      backdropDismiss: false,
      cssClass: 'info_screen'
    });
    infoScreen.present();
  }
  DarkMode(e){
    if(e.detail.checked){
      document.body.setAttribute('color-theme', 'dark')
    }else{
      document.body.setAttribute('color-theme', 'light')
    }
  }
  updateLanguage(value){
    
    this.settings.updateLanguage(value.detail.value);
  }


  updateOnlineMode(e){
    
    this.settings.updateOnlineMode(e.detail.checked);
  }
  updateDifficaly(e){
    console.log(e.detail)
    this.settings.updateDifficulty(parseInt( e.detail.value))
  }

  nextPage(){
    this.navCtrl.navigateRoot('home');
  }

  prevPage(){
    this.navCtrl.navigateRoot('statistics');
  }
}
