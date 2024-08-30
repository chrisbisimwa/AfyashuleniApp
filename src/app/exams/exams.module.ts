import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamsPage } from './exams.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { ExamsPageRoutingModule } from './exams-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    ExamsPageRoutingModule
  ],
  declarations: [ExamsPage]
})
export class ExamsPageModule {}
