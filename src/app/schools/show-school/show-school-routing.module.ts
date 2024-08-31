import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowSchoolPage } from './show-school.page';

const routes: Routes = [
  {
    path: '',
    component: ShowSchoolPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowSchoolPageRoutingModule {}
