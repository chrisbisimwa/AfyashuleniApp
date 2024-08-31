import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowSchoolPage } from './show-school.page';

describe('ShowSchoolPage', () => {
  let component: ShowSchoolPage;
  let fixture: ComponentFixture<ShowSchoolPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowSchoolPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
