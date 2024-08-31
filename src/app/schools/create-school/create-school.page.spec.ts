import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateSchoolPage } from './create-school.page';

describe('CreateSchoolPage', () => {
  let component: CreateSchoolPage;
  let fixture: ComponentFixture<CreateSchoolPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSchoolPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
