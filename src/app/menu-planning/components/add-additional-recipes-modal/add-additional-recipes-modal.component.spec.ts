import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdditionalRecipesModalComponent } from './add-additional-recipes-modal.component';

describe('AddAdditionalRecipesComponent', () => {
  let component: AddAdditionalRecipesModalComponent;
  let fixture: ComponentFixture<AddAdditionalRecipesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAdditionalRecipesModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAdditionalRecipesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
