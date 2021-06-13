import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Toeic600PageRoutingModule } from './toeic600-routing.module';

import { Toeic600Page } from './toeic600.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Toeic600PageRoutingModule
  ],
  declarations: [Toeic600Page]
})
export class Toeic600PageModule {}
