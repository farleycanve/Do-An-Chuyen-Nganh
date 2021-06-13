import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';


@Component({
  selector: 'app-replay',
  templateUrl: './replay.component.html',
  styleUrls: ['./replay.component.scss'],
})
export class ReplayComponent implements OnInit {
@Input() data:any
  players:any
  constructor(private modalCtrl:ModalController) { }

  ngOnInit() {
    this.players=this.data
    console.log(this.data)
  }
  close(){
    this.modalCtrl.dismiss();
    
  }
}
