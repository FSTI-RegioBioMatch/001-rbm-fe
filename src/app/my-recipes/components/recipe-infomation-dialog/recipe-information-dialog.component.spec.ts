import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeInformationDialogComponent } from './recipe-information-dialog.component';

describe('RecipeInfomationDialogComponent', () => {
  let component: RecipeInformationDialogComponent;
  let fixture: ComponentFixture<RecipeInformationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeInformationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeInformationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
