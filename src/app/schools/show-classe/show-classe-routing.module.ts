import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowClassePage } from './show-classe.page';

const routes: Routes = [
  {
    path: '',
    component: ShowClassePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowClassePageRoutingModule {}
