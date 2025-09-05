import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditStudentPageRoutingModule } from './edit-student-routing.module';

import { EditStudentPage } from './edit-student.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditStudentPageRoutingModule
  ],
  declarations: [EditStudentPage]
})
export class EditStudentPageModule {}
