import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { SchoolsPage } from './schools.page';

describe('SchoolsPage', () => {
  let component: SchoolsPage;
  let fixture: ComponentFixture<SchoolsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchoolsPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
