import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { GameDataService } from '../services/game-data.service';
import { SettingsService } from '../services/settings.service';
import { WordRandomService } from '../services/word-random.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private alertCtrl: AlertController,
    private navCtrl: NavController, 
    private loader: LoadingController,
    private data: GameDataService,
    private settings: SettingsService,
    private randomWord: WordRandomService) {}
ngOnInit() { 
  // If app is launched for the first time, language is asked
  if(this.settings.initialized!=true){
    console.log(this.settings.initialized)
    this.settings.initDB();
    this.settings.updateLanguage('english').then(() => {
      this.settings.getDictionaryFile().then(() => {
        //this.showStory();
      this.data.dictionary = 'english';
      this.data.reset_game();
    })
  });

  }else{
    // Reset if app is just opened (no word yet)
    if(this.data.word == ""){
      this.reset();
    }
  }
}


// Shows story of the game


async reset(){
  let loading = await this.loader.create({
    message: 'Loading words...'
  })
  loading.present();

  await this.data.reset_game()
  await loading.dismiss()
}
}
