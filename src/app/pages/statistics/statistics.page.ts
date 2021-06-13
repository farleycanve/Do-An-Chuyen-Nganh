import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
 

import { GameDataService } from '../../services/game-data.service'
import { SettingsService } from '../../services/settings.service'
@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
})
export class StatisticsPage implements OnInit {

  constructor(private alertCtrl: AlertController,
    private navCtrl: NavController,
    private data: GameDataService,
    private settings: SettingsService) { }

  ngOnInit() {
  }
  victory_percent(){
    return Math.round(this.data.victories() / (this.data.victories() + this.data.losses()) * 100);
  }

  loss_percent(){
    return Math.round(this.data.losses() / (this.data.victories() + this.data.losses()) * 100);
  }

  // Gives confirmation prompt and resets statistics, if user so wishes
  async reset(){
    let confirm = await this.alertCtrl.create({
      header: this.settings.lang.delete_statistics,
      message: this.settings.lang.delete_message,
      buttons: [
        {
          text: this.settings.lang.cancel
        },
        {
          text: this.settings.lang.reset,
          handler: () => { this.data.reset_statistics(); }
        }
      ]
    });
    confirm.present();
  }

  nextPage(){
    this.navCtrl.navigateRoot('home');
  }

  prevPage(){
    //this.navCtrl.setRoot(HangmanPage);
  }

}
