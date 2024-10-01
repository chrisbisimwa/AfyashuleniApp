import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowExamPage } from './show-exam.page';

const routes: Routes = [
  {
    path: '',
    component: ShowExamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowExamPageRoutingModule {}
