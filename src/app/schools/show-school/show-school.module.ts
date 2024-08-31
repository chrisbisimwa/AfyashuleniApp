import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowSchoolPageRoutingModule } from './show-school-routing.module';

import { ShowSchoolPage } from './show-school.page';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowSchoolPageRoutingModule,
    GoogleMapsModule
  ],
  declarations: [ShowSchoolPage]
})
export class ShowSchoolPageModule {}
