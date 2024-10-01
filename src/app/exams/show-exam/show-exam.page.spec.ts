import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowExamPage } from './show-exam.page';

describe('ShowExamPage', () => {
  let component: ShowExamPage;
  let fixture: ComponentFixture<ShowExamPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowExamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
