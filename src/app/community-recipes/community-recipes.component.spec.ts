import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityRecipesComponent } from './community-recipes.component';

describe('CommunityRecipesComponent', () => {
  let component: CommunityRecipesComponent;
  let fixture: ComponentFixture<CommunityRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommunityRecipesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommunityRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
