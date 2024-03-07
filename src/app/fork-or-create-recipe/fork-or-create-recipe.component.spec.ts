import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForkOrCreateRecipeComponent } from './fork-or-create-recipe.component';

describe('ForkOrCreateRecipeComponent', () => {
  let component: ForkOrCreateRecipeComponent;
  let fixture: ComponentFixture<ForkOrCreateRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForkOrCreateRecipeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ForkOrCreateRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
