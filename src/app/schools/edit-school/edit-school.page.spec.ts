import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditSchoolPage } from './edit-school.page';

describe('EditSchoolPage', () => {
  let component: EditSchoolPage;
  let fixture: ComponentFixture<EditSchoolPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSchoolPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
