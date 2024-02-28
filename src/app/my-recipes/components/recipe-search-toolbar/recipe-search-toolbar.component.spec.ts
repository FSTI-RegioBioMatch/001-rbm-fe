import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeSearchToolbarComponent } from './recipe-search-toolbar.component';

describe('RecipeSearchToolbarComponent', () => {
  let component: RecipeSearchToolbarComponent;
  let fixture: ComponentFixture<RecipeSearchToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeSearchToolbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipeSearchToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
