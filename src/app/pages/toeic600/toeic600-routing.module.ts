import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Toeic600Page } from './toeic600.page';

const routes: Routes = [
  {
    path: '',
    component: Toeic600Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Toeic600PageRoutingModule {}
