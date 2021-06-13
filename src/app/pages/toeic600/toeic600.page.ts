import { Component, OnInit } from '@angular/core';


import { Storage } from '@ionic/storage-angular';
import { LoadingController, Platform,NavController} from '@ionic/angular';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-toeic600',
  templateUrl: './toeic600.page.html',
  styleUrls: ['./toeic600.page.scss'],
})


export class Toeic600Page implements OnInit {
  public database: Storage;
  // words list 
  public words:any[];
  public a:any[];


  constructor(public navCtrl: NavController,
   
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public http:HttpClient
    ) 
    {
      this.loadWordsData();
     }

  ngOnInit() {
    // fetch('assets/words/Toeic600.json').then(res=>res.json()).then(json=>{
    //   this.words=json
      
    // })
  }


  
  ionViewDidLoad() {
    console.log('ionViewDidLoad WordsList');
  }

  //go to word detail
  goToWordsDetail(selectedWord) {
    
  }
  // function load data
  async loadWordsData() {
    // check if array lesson is empty
    
      //using loading controller to create loading icon while loading data
      let loading = this.loadingCtrl.create({
        
        message: 'Please wait...'
      });
      // display loading icon
      (await loading).present();
      //get data and push in to array this.lessons

    return this.http.get('assets/words/Toeic600.json').toPromise().then( async (data) =>{
        
        const resultArray = Object.keys(data).map(function(key){
          var object = data[key];
          return object;
        });
        resultArray.map(function (current) {
          current['example']=[];
          current['families']=[];

        })
        this.words=resultArray;
        (await loading).dismiss()
      })
    
    
    
  } // end function getWordsData
}
