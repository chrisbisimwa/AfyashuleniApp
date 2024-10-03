import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditClassePage } from './edit-classe.page';

describe('EditClassePage', () => {
  let component: EditClassePage;
  let fixture: ComponentFixture<EditClassePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditClassePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
