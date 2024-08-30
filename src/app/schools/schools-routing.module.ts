import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolsPage } from './schools.page';

const routes: Routes = [
  {
    path: '',
    component: SchoolsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolsPageRoutingModule {}
