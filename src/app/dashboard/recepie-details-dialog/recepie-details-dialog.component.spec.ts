import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepieDetailsDialogComponent } from './recepie-details-dialog.component';

describe('RecepieDetailsDialogComponent', () => {
  let component: RecepieDetailsDialogComponent;
  let fixture: ComponentFixture<RecepieDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepieDetailsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecepieDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
