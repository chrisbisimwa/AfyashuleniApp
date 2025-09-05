import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditStudentPage } from './edit-student.page';

describe('EditStudentPage', () => {
  let component: EditStudentPage;
  let fixture: ComponentFixture<EditStudentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStudentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
