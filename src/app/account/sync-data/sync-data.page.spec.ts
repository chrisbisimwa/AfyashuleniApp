import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SyncDataPage } from './sync-data.page';

describe('SyncDataPage', () => {
  let component: SyncDataPage;
  let fixture: ComponentFixture<SyncDataPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncDataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
