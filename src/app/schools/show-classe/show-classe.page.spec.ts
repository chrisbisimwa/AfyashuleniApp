import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowClassePage } from './show-classe.page';

describe('ShowClassePage', () => {
  let component: ShowClassePage;
  let fixture: ComponentFixture<ShowClassePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowClassePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
