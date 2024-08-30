import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamsPage } from './exams.page';

const routes: Routes = [
  {
    path: '',
    component: ExamsPage,
  },
  {
    path: 'new',
    loadChildren: () => import('./new/new.module').then( m => m.NewPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamsPageRoutingModule {}
