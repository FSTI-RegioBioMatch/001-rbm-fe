import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipieDetailsComponent } from './recipie-details.component';

describe('RecipieDetailsComponent', () => {
  let component: RecipieDetailsComponent;
  let fixture: ComponentFixture<RecipieDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipieDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipieDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
