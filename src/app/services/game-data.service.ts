import { DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { SettingsService } from './settings.service'
import { WordRandomService } from './word-random.service'
import { HttpClient } from '@angular/common/http';
import { promise } from 'selenium-webdriver';

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  victory: boolean = false;
  guesses: string[] = [];
  guesses_left: number;
  word: string = "";
  lsword:string[]=[];
  group:string="";
  word_guess:string = "";
  dictionary: string;
  options = {
    headers: {
      'Accept': 'application/json',
      'app_id': '668c6135',
      'app_key': '677afcd7708115d588b8009ffb7ccdde'
    }
  };
  music:any;
  define:any;
 
  
 
  // Statistics
  public statistics = {
    victories: 0,
    losses: 0,
    round: 1,
    score: 10,
    level:0,
    alive:2,
    maxScore:0,
    maxLevel:0
  }

  victories(){
    return this.statistics.victories;
  }
  losses(){
    return this.statistics.losses;
  }
  round(){
    return this.statistics.round;
  }
  level(){
    return this.statistics.level;
  }
  MaxPoint(){
    return this.statistics.maxScore
  }
  MaxLevel(){
    return this.statistics.maxLevel
  }
  score():Number{
    const aa=this.statistics.score
    return aa;
  }
  constructor(private storage: Storage,
    private settings: SettingsService,
    private wordRandomizer: WordRandomService,
    private http: HttpClient
    ) { 
      this.guesses_left = settings.max_guesses;
    }
  // Initialises statics from local memory and set current dictionary
  init(){
    this.storage.get('statistics').then((stats) => {
      if(stats !== null){
        this.statistics = stats;
      }
    })
    //this.dictionary = this.settings.settings.dictionary;
  }

  // Adds a victory and saves statistics
  add_victory(){
    this.statistics.victories++;
    this.statistics.round++;
    this.statistics.level=Math.floor(Math.pow(this.statistics.round, 8/9))
    
    this.statistics.score+=(3+this.statistics.level);
    this.storage.set('statistics', this.statistics);
    if(this.statistics.maxLevel<this.statistics.level||this.statistics.score>this.statistics.maxScore){
      this.statistics.maxLevel=this.statistics.level;
      this.statistics.maxScore=this.statistics.score;
    }
    if(this.statistics.level>5)
    {
      this.settings.settings.dictionary='normal'
    }
    if(this.statistics.level>10)
    {
      this.settings.settings.dictionary='difficult'
    }
  }
  check_win(){
    
      for(var i=0; i<this.word.length; i++){
        // Character in list is not in the word 
        if(this.guesses.indexOf(this.word[i]) < 0 ){
          return true;
        }
      }
    //this.add_victory();
    return false;
  }
  // Adds a loss and saves statistics
  add_loss(){
    if(this.statistics.alive==0)
    {
      if(this.statistics.score<20 || this.statistics.level<4){
        this.statistics.level=0;
        this.statistics.alive=2;
        this.statistics.score=10;
      }else{
      this.statistics.level=Math.floor(this.statistics.level*(this.statistics.score/(3*this.statistics.round)*0.7))
      this.statistics.round=1;
      this.statistics.score=0;
      }
    }
    else
      this.statistics.alive--;
    
    this.statistics.losses++;
    this.statistics.round=1;
    this.storage.set('statistics', this.statistics);
  }

  // Guesses a character. False guesses reduce amount of guesses.
  // Returns true if game ends.
  guess(a){
    
    this.guesses.push(a);
    if(this.word.indexOf(a) > -1){
      return this.reveal_word();
    }else{
      // Harder difficulties have fewer guesses
      if(this.guesses_left == this.settings.max_guesses){
        this.guesses_left -= this.settings.settings.difficulty;
      }

      this.guesses_left -= 1;
      if(this.guesses_left <= 0){
        this.victory = false;
        return true;
      }
      return false;
    }
  }
  
  help(){
    this.statistics.score-=2;
    for(var i=0; i<this.word.length; i++){
      // Character is not in the guesses or it is in the alphabet
      if(this.guesses.indexOf(this.word[i]) < 0 && this.settings.alphabet.indexOf(this.word[i]) != -1){
        this.guesses.push(this.word[i])
        this.reveal_word();
        return;
      }
    }
  }
  help2(){
    this.statistics.score-=5;
  }
  getAudio(w:string):Promise<string>{
    let promise = new Promise<string>((resolve, reject) => {
      var url='https://cors-anywhere.herokuapp.com/https://od-api.oxforddictionaries.com/api/v2/entries/en-us/'+w+'?fields=pronunciations&strictMatch=false'
      
      this.http.get(url,this.options).subscribe(data=>{
       
        var abc=JSON.parse(JSON.stringify(data))
        try{
          abc=abc.results[0].lexicalEntries[0].entries[0].pronunciations[1].audioFile
          resolve(abc);
        }catch{
          resolve("not found pronounce this word");
        }
        //path: x.results[0].lexicalEntries[0].entries[0].pronunciations[1].audioFile
      })
    })
  return promise
  }
  getDefine(w:string):Promise<string>{
    let promise = new Promise<string>((resolve, reject) => {
    var url='https://cors-anywhere.herokuapp.com/https://od-api.oxforddictionaries.com/api/v2/entries/en-us/'+w+'?fields=definitions&strictMatch=false'
    var ac
      
        this.http.get(url, this.options).subscribe(data => {
          try{
          var abc = JSON.parse(JSON.stringify(data));
          ac = abc.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0];
          resolve(ac)
        }catch{
          resolve("not found pronounce this word");
        }
          
        })
        
        
  })
    return promise
  }
  // Resets game by getting a new word and re-initialising variables
  async reset_game(){
    this.guesses=[];
    const word = await this.wordRandomizer.getWord();
    this.group = word['name'];
    this.lsword = word['words'];
    this.word = this.lsword[Math.floor(Math.random() * this.lsword.length)].toLocaleUpperCase();
    console.log(this.word);
    this.music=await this.getAudio(this.word)
    this.define=await this.getDefine(this.word)
    this.guesses_left = this.settings.max_guesses;
    this.reveal_word();
  }

  // Resets statics information and saves changes to memory
  reset_statistics(){
    this.statistics.victories = 0;
    this.statistics.losses = 0;
    this.statistics.maxLevel=0;
    this.statistics.maxScore=0
    this.storage.set('statistics', this.statistics);
  }
  
  // Reveals characters in the word which are guessed correctly
  // If a character isn't in the alphabet list, it is shown automatically (dashes and foreign characters, as an example)
  // If revealed word matches original word, returns true
  reveal_word(){
    let reveal = "";
    this.guesses.push(this.word[0])
    if(this.word.length>8){
      this.guesses.push(this.word[8])
    }
    for(var i=0; i<this.word.length; i++){
      // Character is in the word or it isn't in the alphabet
      if(this.guesses.indexOf(this.word[i]) > -1 || this.settings.alphabet.indexOf(this.word[i]) == -1){
        reveal += this.word[i];
      }else{
        reveal += "_";
      }
    }
    this.word_guess = reveal;
    // Victory
    if(reveal == this.word){
      this.victory = true;
      return true;
    }
    return false;
  }
  
}
