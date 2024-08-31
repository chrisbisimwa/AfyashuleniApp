import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolsPage } from './schools.page';

const routes: Routes = [
  {
    path: '',
    component: SchoolsPage,
  },
  {
    path: ':id/view',
    loadChildren: () => import('./show-school/show-school.module').then( m => m.ShowSchoolPageModule)
  },
  {
    path: 'new',
    loadChildren: () => import('./create-school/create-school.module').then( m => m.CreateSchoolPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolsPageRoutingModule {}
