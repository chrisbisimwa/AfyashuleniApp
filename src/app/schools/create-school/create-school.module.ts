import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateSchoolPageRoutingModule } from './create-school-routing.module';

import { CreateSchoolPage } from './create-school.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateSchoolPageRoutingModule
  ],
  declarations: [CreateSchoolPage]
})
export class CreateSchoolPageModule {}
