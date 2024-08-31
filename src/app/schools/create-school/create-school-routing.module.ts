import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateSchoolPage } from './create-school.page';

const routes: Routes = [
  {
    path: '',
    component: CreateSchoolPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateSchoolPageRoutingModule {}
