import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallAnalysisComponent } from './call-analysis.component';

describe('CallAnalysisComponent', () => {
  let component: CallAnalysisComponent;
  let fixture: ComponentFixture<CallAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CallAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
