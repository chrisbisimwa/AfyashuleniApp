import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditClassePageRoutingModule } from './edit-classe-routing.module';

import { EditClassePage } from './edit-classe.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditClassePageRoutingModule
  ],
  declarations: [EditClassePage]
})
export class EditClassePageModule {}
