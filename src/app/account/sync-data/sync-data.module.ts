import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SyncDataPageRoutingModule } from './sync-data-routing.module';

import { SyncDataPage } from './sync-data.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SyncDataPageRoutingModule
  ],
  declarations: [SyncDataPage]
})
export class SyncDataPageModule {}
