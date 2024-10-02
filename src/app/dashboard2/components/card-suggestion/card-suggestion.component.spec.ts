import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSuggestionComponent } from './card-suggestion.component';

describe('CardSuggestionComponent', () => {
  let component: CardSuggestionComponent;
  let fixture: ComponentFixture<CardSuggestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSuggestionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
