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
    this.askLanguage();

  }else{
    // Reset if app is just opened (no word yet)
    if(this.data.word == ""){
      this.reset();
    }
  }
}
async askLanguage() {
  let inputs = this.settings.languages.map((lang) =>  {
    return {
      type: 'radio',
      label: lang,
      value: lang,
      checked: lang == 'english'
    }
  });
  var resultArray = Object.keys(inputs).map(function(inputsIndex){
    let input = inputs[inputsIndex];
    // do something with input
    return input;
  });
  let alert = await this.alertCtrl.create({
    header: 'Select language',
    inputs: resultArray,
    buttons: [{
      text: 'Continue',
      handler: lang => {
          this.settings.updateLanguage(lang).then(() => {
            this.settings.getDictionaryFile().then(() => {
              //this.showStory();
            this.data.dictionary = 'english';
            this.data.reset_game();
          })
        });
      }
    }],
    backdropDismiss: false,
    cssClass: 'language_screen'
  })
  alert.present();
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
