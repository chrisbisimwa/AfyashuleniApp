import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SyncDataPage } from './sync-data.page';

const routes: Routes = [
  {
    path: '',
    component: SyncDataPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SyncDataPageRoutingModule {}
