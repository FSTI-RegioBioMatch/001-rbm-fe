import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMenusComponent } from './my-menus.component';

describe('MyMenusComponent', () => {
  let component: MyMenusComponent;
  let fixture: ComponentFixture<MyMenusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMenusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyMenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
