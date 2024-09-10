import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMenuPlansComponent } from './my-menu-plans.component';

describe('MyMenuPlansComponent', () => {
  let component: MyMenuPlansComponent;
  let fixture: ComponentFixture<MyMenuPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMenuPlansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyMenuPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
