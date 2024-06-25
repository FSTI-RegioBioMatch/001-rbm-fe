import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateRecipeTableComponent } from './private-recipe-table.component';

describe('PrivateRecipeTableComponent', () => {
  let component: PrivateRecipeTableComponent;
  let fixture: ComponentFixture<PrivateRecipeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateRecipeTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivateRecipeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
