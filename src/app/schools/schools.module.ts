import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolsPage } from './schools.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { SchoolsPageRoutingModule } from './schools-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    SchoolsPageRoutingModule
  ],
  declarations: [SchoolsPage]
})
export class SchoolsPageModule {}
