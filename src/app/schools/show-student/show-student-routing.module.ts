import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowStudentPage } from './show-student.page';

const routes: Routes = [
  {
    path: '',
    component: ShowStudentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowStudentPageRoutingModule {}
