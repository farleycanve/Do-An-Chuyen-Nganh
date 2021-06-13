import {ElementRef, ViewChild,Component, OnInit, AfterViewInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastController ,Platform, AlertController, ModalController, LoadingController} from '@ionic/angular';
import{ReplayComponent} from '../../replay/replay.component'


@Component({
  selector: 'app-online',
  templateUrl: './online.page.html',
  styleUrls: ['./online.page.scss'],
})
export class OnlinePage implements AfterViewInit {
    @ViewChild('imageCanvas', { static: false }) canvas: any;
    @ViewChild('sketchpad') focusView: ElementRef;
    pad:any;
    canvasElement: any;
    saveX: number;
    saveY: number;
  
    context:any;
    message = '';
    messages = [];
    currentUser={
      name:'',
      id:'',
      score:0
    };
    UserQuestion=false;
    host=false;
    currentRoom = '';
    drawing = false;
    khoa;
    selectedColor = '#459cde';
    current = {
      x:0,
      y:0,
      color: 'black'
    };
  //game
    timerID:any;
    pickWordID:any;
    hints = [];
    round:any;
    time:any;
    ListPlayer=[];
    alert:any;
    curenWord:any;
    curentTime:any;
    permitDraw=true;
  
    colors = [ '#9e2956', '#c2281d', '#de722f', '#edbf4c', '#5db37e', '#459cde', '#4250ad', '#802fa3' ];
    lineWidth = 5;
    constructor(private plt: Platform,
      private socket: Socket, 
      private toastCtrl: ToastController,
      private alertController:AlertController,
      private modalCtrl:ModalController,
      private loader: LoadingController,
      ) {}
    async ngOnInit() {
      try {
        this.socket.connect();
      } catch (error) {
        console.log(error)
      }
      
      const modal=await this.modalCtrl.create({
        component: ReplayComponent
  
      })
      let loading = await this.loader.create({
        message: 'Loading words...'
      })
      this.AlertPromptNameAndUser()
      if(this.host==true){
        await loading.present()
      }
      
      //this.startGame();
  
  
      this.socket.on('users-changed',data => {
        let user = data.username;
        if (data['event'] === 'left') {
          this.showToast('User left: ' + user);
        } else {
          this.showToast('User joined: ' + user);
        }
      });
   
      
      
      //canvas
      this.socket.fromEvent('drawing').subscribe(data => {
        this.onDrawingEvent(data)
      });
      this.socket.on('clearCanvas', () => this.ClearCanvas());
      this.socket.on('disableCanvas',  () => this.DisableCanvas())
      //game
      //this.socket.on('joinRoom');
      //this.socket.on('otherPlayers', (players) => );
      this.socket.on('disconnection', async (player) => {this.showToast('user :'+player.name+' leave room')
      
      })
      
      this.socket.on('startGame', ()=> this.showToast('Game start'));
      this.socket.on('newPrivateRoom', (data) => {
        this.PresentStart(data);
      })
      //=============
      this.socket.on('getPlayers', (players) => {this.ListPlayer=players
      console.log(players)
      });
      //hien user dang chon
      this.socket.on('choosing', ({ name }) => {
        this.permitDraw=false;
        this.showToast('the user '+name+' is chossing word')
        clearInterval(this.timerID);
        
        //clock.stop();
      });
      this.socket.on('settingsUpdate', (data) => {
        this.round = data.rounds;
        this.time = data.time;
        console.log(data)
      });
      this.socket.on('hints', (data) => { this.hints = data;
      console.log(data) });
      
      this.socket.on('chooseWord', async ([word1, word2, word3]) => {
        console.log('update word')
        this.permitDraw=true;
        clearInterval(this.timerID);
        this.PresentChooseWord(word1,word2,word3)
        //yourTurn.play();
       
      });
      this.socket.on('hideWord', (word ) => {
        this.curenWord=word.word;
        console.log(word)
      });
      this.socket.on('startTimer', ( time ) => {
        console.log({time})
        this.startTimer(time.time)
        
      });
      this.socket.on('message',(data) =>{this.appendMessage(data)});
      this.socket.on('closeGuess', (data) => {this.CorrectGess(data)
      });
      this.socket.on('correctGuess', (data) => {this.CorrectGess(data)
      });
      
      this.socket.on('lastWord', ({ word }) => this.lastword(word));
      this.socket.on('updateScore', (
        // playerID,
        // score,
        // drawerID,
        // drawerScore,
        data
    ) => this.UpdateScore(data))
    this.socket.on('endGame', async ({stats }) => {
      
      clearInterval(this.timerID);
      const modal = await this.modalCtrl.create({
        component: ReplayComponent,
        cssClass: 'my-custom-class',
        componentProps:{
          'data':this.ListPlayer
        }
      });
      await modal.present();
      await modal.onWillDismiss()
        
      await this.AlertPromptNameAndUser();
      
    })
    }
    CorrectGess(data){
      
        var mes1 = {
          id:"",
          message:data.message
        };
        this.messages.push(mes1)
    
    }
    async AlertPromptNameAndUser() {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Infomation!',
        inputs: [
          {
            name: 'name',
            type: 'text',
            placeholder: 'Name'
          },
          {
            name: 'id',
            type: 'text',
            placeholder: 'Room'
          },
          ],
          
          buttons: [
             {
              text: 'OK',
              handler: (data) => {
                if(!data.id||!data.name)
                {
                  this.showToast('please fill the form');
                  this.AlertPromptNameAndUser();
                }else
                {
                  this.currentUser.name=data.name;
                  this.currentUser.id=this.socket.ioSocket.id
                  
                  
                  this.socket.emit('joinRoom',{ id:data.id, player: this.currentUser })
                  this.host=false;
  
                }
                
              }
            },
            {
              text:'create',
              handler:(data)=>{
                if(!data.name)
                {
                  this.showToast('please fill the form');
                  this.AlertPromptNameAndUser();
                }else
                {
                  this.host=true;
                  this.currentUser.name=data.name;
                  this.currentUser.id=this.socket.ioSocket.id;
                  this.currentRoom=data.id;
                  
                  this.socket.emit('newPrivateRoom',this.currentUser)
                  
                }
              }
            }
          ]
        });
    
        await alert.present();
      }
    
    ngAfterViewInit() {
      
      // Set the Canvas Element and its size
      this.canvasElement = this.canvas.nativeElement;
      this.canvasElement.width = this.plt.width() + '';
      this.canvasElement.height = 200;
      this.context =this.canvasElement.getContext('2d');
    }
  
    sendMessage() {
      
      this.socket.emit('message', { message:this.message });
      
      this.message = '';
    }
   
    ionViewWillLeave() {
      this.socket.disconnect();
    }
   
    async showToast(msg) {
      let toast = await this.toastCtrl.create({
        message: msg,
        position: 'top',
        duration: 2000
      });
      toast.present();
    }
  //===========================
    ClearCanvas(){
      this.context.clearRect(0, 0,this.plt.width() + '' , 200);
      if(this.permitDraw==true)
      this.socket.emit('clearCanvas')
    }
    DisableCanvas(){
      this.permitDraw=false;
    }
    //====================================================================
    
    drawLine(x0, y0, x1, y1, color, emit){
      this.context.beginPath();
      this.context.moveTo(x0, y0);
      this.context.lineTo(x1, y1);
      this.context.strokeStyle = color;
      this.context.lineWidth = 2;
      this.context.stroke();
      this.context.closePath();
  
      if (!emit) { return; }
      var w = this.canvasElement.width;
      var h = this.canvasElement.height;
  
      this.socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: this.selectedColor
      });
    }
    draw(x0, y0, x1, y1, color){
      this.context.beginPath();
      this.context.moveTo(x0, y0);
      this.context.lineTo(x1, y1);
      this.context.strokeStyle = color;
      this.context.lineWidth = 2;
      this.context.stroke();
      this.context.closePath();
    }
   
    selectColor(color) {
      this.selectedColor = color;
    }
    setBackground() {
      var background = new Image();
      background.src = './assets/IMG_0219.png';
      let ctx = this.canvasElement.getContext('2d');
   
      background.onload = () => {
        ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);   
      }
    }
    startDrawing(e){
      this.drawing=this.permitDraw;
      var canvasPosition = this.canvasElement.getBoundingClientRect();
      this.current.x =  e.pageX - canvasPosition.x;
      this.current.y = e.pageY - canvasPosition.y;
    }
  
    endDrawing(e){
      console.log(e)
      var canvasPosition = this.canvasElement.getBoundingClientRect();
      if (!this.drawing) { return; }
      this.drawing = false;
      this.drawLine(this.current.x, this.current.y, e.pageX - canvasPosition.x, e.pageY - canvasPosition.y, this.selectedColor, true);
    }
  
    moved(e){
      var canvasPosition = this.canvasElement.getBoundingClientRect();
      if (!this.drawing) { return; }
      this.drawLine(this.current.x, this.current.y, e.pageX - canvasPosition.x, e.pageY - canvasPosition.y, this.selectedColor, true);
      this.current.x = e.pageX - canvasPosition.x;
      this.current.y = e.pageY - canvasPosition.y;
    }
    
    onDrawingEvent(data){
      var w = window.innerWidth;
      var h = 200;
      this.drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color,false);
      return;
    }
  
    //game============================================
    startGame(){
      this.socket.emit('startGame');
      this.socket.emit('getPlayers');
    }
    async PresentChooseWord(word1,word2,word3){
      var id =setTimeout(() => {
        this.chooseWord(word2)
        alert.dismiss()
        this.curenWord=word2}, 15000);
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'You choose Word',
          buttons: [
            {
              text: word1,
              cssClass: 'secondary',
              handler: () => {
                this.chooseWord(word1)
                this.curenWord=word1
                clearTimeout(id)
              }
            }, {
              text: word2,
              handler: () => {
                this.chooseWord(word2)
                this.curenWord=word2
                clearTimeout(id)
              }
            }, {
              text: word3,
              handler: () => {
                this.chooseWord(word3)
                this.curenWord=word3
                clearTimeout(id)
              }
            }
          ]
        })
        await alert.present();
        
    }
    chooseWord(word) {
      clearTimeout(this.pickWordID);
      this.drawing=true;
      this.socket.emit('chooseWord', { word });
    }
    UpdateOclcok(){
      this.curentTime--
      for(var i=0;i<this.hints.length;i++)
      {
      if(this.host==false)
        if(this.hints[i].displayTime==this.curentTime&&this.permitDraw==false)
          this.curenWord=this.hints[i].hint
      }
      if (this.curentTime === 0) clearInterval(this.timerID);
    }
    startTimer(ms:number) {
      console.log( ms)
      let secs = ms / 1000;
      this.curentTime=secs
      const id = setInterval(()=> this.UpdateOclcok(), 1000);
      
      this.timerID = id;
      
    }
    appendMessage(data) {
      
      if (data.name !== '') {
         var mes = {
          id:"1",
          message:data.name+ ': '+data.message
        };
        this.messages.push(mes)
      }else{
        var mes1 = {
          id:"",
          message:data.message
        };
        this.messages.push(mes1)
      }
      
      
      
    }
    showArea(){
  
    }
    lastword(word){
      var mes1 = {
        id:"",
        message:'the last word is '+word
      };
      this.messages.push(mes1)
    }
    
    UpdateScore(data)
    {
      this.ListPlayer.forEach(player => {
        console.log(data.playerID+' '+player.id)
        
        if(player.id==data.playerID)
        {
          console.log("leu ley")
          player.score=data.score
        }
        if(player.id==data.drawerID)
          player.score=data.drawerScore
        console.log(this.ListPlayer)
        
      });
      this.ListPlayer = this.ListPlayer.sort((id1, id2) => this.ListPlayer[this.ListPlayer.indexOf(id2)].score - this.ListPlayer[this.ListPlayer.indexOf(id1)].score);
      
    }
    async PresentStart(data){
      console.log(data)
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Welcome',
      message: 'ID room: '+data.gameID,
      
      buttons: [
        {
          text: 'start',
          cssClass: 'secondary',
          handler: (data) => {
            this.socket.emit('settingsUpdate', {
              rounds:3,
              time: 50,
              customWords:'',
              probability: 5,
            });
            this.socket.emit('startGame');
            this.socket.emit('getPlayers');
          }
        }
      ]
    })
    await alert.present();
    }
    async presentModal(data) {
      
    }
  }
  