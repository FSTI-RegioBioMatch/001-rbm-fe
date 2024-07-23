import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRecepieDialogComponent } from './new-recepie-dialog.component';

describe('NewRecepieDialogComponent', () => {
  let component: NewRecepieDialogComponent;
  let fixture: ComponentFixture<NewRecepieDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRecepieDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewRecepieDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
