import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowClassePageRoutingModule } from './show-classe-routing.module';

import { ShowClassePage } from './show-classe.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowClassePageRoutingModule
  ],
  declarations: [ShowClassePage]
})
export class ShowClassePageModule {}
