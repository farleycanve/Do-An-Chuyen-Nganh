import { Component, OnInit } from '@angular/core';
import {ModalController } from '@ionic/angular';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit {

  constructor(public modalController: ModalController) { }

  ngOnInit() {}
  dismissResult(){
    this.modalController.dismiss();
  }
}
