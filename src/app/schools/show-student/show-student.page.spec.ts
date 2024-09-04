import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowStudentPage } from './show-student.page';

describe('ShowStudentPage', () => {
  let component: ShowStudentPage;
  let fixture: ComponentFixture<ShowStudentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowStudentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
