import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowupPage } from './followup.page';

describe('FollowupPage', () => {
  let component: FollowupPage;
  let fixture: ComponentFixture<FollowupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
