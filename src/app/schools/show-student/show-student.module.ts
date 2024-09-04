import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowStudentPageRoutingModule } from './show-student-routing.module';

import { ShowStudentPage } from './show-student.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowStudentPageRoutingModule
  ],
  declarations: [ShowStudentPage]
})
export class ShowStudentPageModule {}
