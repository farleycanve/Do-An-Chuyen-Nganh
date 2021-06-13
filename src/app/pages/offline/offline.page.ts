import { Component } from '@angular/core';
import {AlertController, NavController, LoadingController,ModalController, ToastController } from '@ionic/angular';

import { GameDataService } from '../../services/game-data.service'
import { SettingsService } from '../../services/settings.service'
import { WordRandomService } from '../../services/word-random.service'
import {ResultComponent} from '../../model/result/result.component'

@Component({
  selector: 'app-offline',
  templateUrl: './offline.page.html',
  styleUrls: ['./offline.page.scss'],
})
export class OfflinePage {
  music = new Audio();
  audio=new Audio();
  checkscore= true;
  checkscore2= true;
  flagHep2=true;
  useHelp2=false;
  alive0=true;
  iconAlive:any;
  
  constructor(private alertCtrl: AlertController,
    private navCtrl: NavController, 
    private loader: LoadingController,
    private data: GameDataService,
    private settings: SettingsService,
    private randomWord: WordRandomService,
    public modalController: ModalController,
    private toastCtrl:ToastController
    ) {
}

  async ngOnInit() { 
    //this.customToast()
  // If app is launched for the first time, language is asked
  if(!this.settings.initialized){
    this.showStory();
  
  }
  this.showDefine();
  this.music.src = "../../../assets/audio/music.ogv";
  this.music.load();
  this.music.play();
  this.music.loop=true;
  console.log(Math.floor(16*(1-Math.log10(16))))
  
}

  

// Shows story of the game
async showStory(){
  let storyScreen = await this.alertCtrl.create({
    header: this.settings.lang.story,
    message: this.settings.lang.story_content,
    buttons: [
      {
        text: this.settings.lang.continue,
        cssClass: 'game_over_button'
      }
    ],
    backdropDismiss: false,
    cssClass: 'story_screen'
  });
  await storyScreen.present();
}
async showAlive(n:number){
  
    {
      (await this.toastCtrl.create({
        message:"You have "+(n+1)+" alive",
        duration: 2000,
        position: 'middle',
        cssClass: 'customToastClass'
      })).present();
    }

 
}
// Guesses an alphabet
// If alphabet is in the word, more of the word is revealed.
// Otherwise guesses are reduced.
// Game ends once word has been guessed or all guesses have been used.
guess(a){
  var click=new Audio()
  click.src = "../../../assets/audio/click.ogv";
    click.load();
    click.play();
  
  if(this.data.guess(a)){
      this.gameOver();
  }
}
async showDefine(){
  let define = await this.alertCtrl.create({
    header: 'word definition',
    message: this.data.define,
    buttons: [
      {
        text: 'continue',
        cssClass: 'continue'
      }
    ],
    backdropDismiss: false,
    cssClass: 'story_screen'
  });
  await define.present();
}
  

// Resets the game (gives a new word)
  async reset(){
    this.useHelp2=false;
    this.checkScore();
    let loading = await this.loader.create({
      message: 'Loading words...'
    })
    loading.present();

    await this.data.reset_game().then(() => loading.dismiss());
    await this.showDefine();
  }
  async customToast(){
  (await this.toastCtrl.create({
    message:`<img src="../../../assets/images/banana.gif" >`,
    duration: 2000,
    position: 'middle',
    cssClass: 'customToastClass'
  })).present();
}
// Gives game over screen and adds victory/loss
  async gameOver(){
    
  let gameOverScreen = await this.alertCtrl.create({
    header: this.data.victory ? this.settings.lang.victory : this.settings.lang.game_over,
    message: this.data.victory ? this.settings.lang.victory_message + this.data.word + "." :
      this.settings.lang.game_over_message + this.data.word + ". ",
    buttons: [
      {
        text: this.settings.lang.continue,
        handler: () => {
          this.reset();
        }
      }
    ],
    backdropDismiss: false,
    cssClass: 'game_over_screen'
  });
  if(this.data.victory){
    
    var audio=new Audio()
    audio.src = "../../../assets/audio/win 2.ogv";
    audio.load();
    audio.play();
    this.data.add_victory();
  }else{
    var audio=new Audio()
    audio.src = "../../../assets/audio/win (1).ogv";
    audio.load();
    audio.play();
    this.data.add_loss();
    this.showAlive(this.data.statistics.alive)
  }
  
  gameOverScreen.present();
  this.checkScore();
}
Help(){
  var coin=new Audio()
  coin.src = "../../../assets/audio/nff-coin-03 (1).ogv";
    coin.load();
    coin.play();
  this.data.help();
  if(!this.data.check_win()){
    this.gameOver();
  }
  this.checkScore();
}
async showhepl2(){
  let storyScreen = await this.alertCtrl.create({
    header: "suggestions",
    message: `<img src="../../../assets/sugessimage/`+this.data.word.toLocaleLowerCase()+`.jpg" >`,
    buttons: [
      {
        text: this.settings.lang.continue,
        cssClass: 'game_over_button'
      },
      {
        text:'Pronounce',
        handler:()=>{
          this.pronounce();
        }
      }

    ],
    backdropDismiss: false,
    
  });
  await storyScreen.present();
}
  Help2(){
  
  if(this.useHelp2==false){
      this.data.help2();
    }
  
  var coin=new Audio()
  
  coin.src = "../../../assets/audio/nff-coin-03 (1).ogv";
    coin.load();
    coin.play();
  this.showhepl2()
  //chua sai lan nao thi tru diem
  
  this.useHelp2=true
  this.checkScore();
  console.log(this.flagHep2)
}

Home(){
  this.music.pause();
  this.navCtrl.navigateRoot('/');
}

Statistics(){
  this.navCtrl.navigateRoot('statistics');
}
checkScore(){
  const score=this.data.statistics.score;
  
  if(score < 5){
    this.checkscore2=false;
  }
    
  else
  this.checkscore2=true;
  if(score < 3)
    this.checkscore=false;
  else
    this.checkscore=true;
  if(this.useHelp2==true||this.checkscore2==true)
    {
      this.flagHep2=true
    }else
    this.flagHep2=false
  console.log(this.flagHep2)
}
async presentResult() {
  const modal = await this.modalController.create({
    component: ResultComponent,
    cssClass: 'result',
    componentProps: {
      'header': this.data.victory ? this.settings.lang.victory : this.settings.lang.game_over,
      'body': this.data.victory ? this.settings.lang.victory_message + this.data.word + "." :
      this.settings.lang.game_over_message + this.data.word + ".",
      'middleInitial': 'N'
    },
    swipeToClose:true,
    presentingElement: await this.modalController.getTop()
  });
  this.checkScore();
  return await modal.present();
}
pronounce(){
  this.audio.src = this.data.music;
  this.audio.load();
  this.audio.play();
}


}



