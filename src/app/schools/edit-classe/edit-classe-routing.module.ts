import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditClassePage } from './edit-classe.page';

const routes: Routes = [
  {
    path: '',
    component: EditClassePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditClassePageRoutingModule {}
