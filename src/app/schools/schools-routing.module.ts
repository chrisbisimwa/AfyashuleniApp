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
  },
  {
    path: 'classe/:id/view',
    loadChildren: () => import('./show-classe/show-classe.module').then( m => m.ShowClassePageModule)
  },
  {
    path: 'classe/student/:id/view',
    loadChildren: () => import('./show-student/show-student.module').then( m => m.ShowStudentPageModule)
  },
  {
    path: ':id/edit',
    loadChildren: () => import('./edit-school/edit-school.module').then( m => m.EditSchoolPageModule)
  },
  {
    path: 'classe/:id/edit',
    loadChildren: () => import('./edit-classe/edit-classe.module').then( m => m.EditClassePageModule)
  },
  {
    path: 'classe/student/:id/edit',
    loadChildren: () => import('./edit-student/edit-student.module').then( m => m.EditStudentPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolsPageRoutingModule {}
