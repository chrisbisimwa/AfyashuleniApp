import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowExamPageRoutingModule } from './show-exam-routing.module';

import { ShowExamPage } from './show-exam.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowExamPageRoutingModule
  ],
  declarations: [ShowExamPage]
})
export class ShowExamPageModule {}
