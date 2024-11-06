import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTopsComponent } from './card-tops.component';

describe('CardTopsComponent', () => {
  let component: CardTopsComponent;
  let fixture: ComponentFixture<CardTopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardTopsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardTopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
