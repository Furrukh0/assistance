import { Component, OnInit } from '@angular/core';
import { plans } from './data';

@Component({
    selector: 'app-plan',
    templateUrl: './plan.component.html',
    styleUrls: ['./plan.component.scss'],
    standalone: false
})

/**
 * Plan Component
 */
export class PlanComponent implements OnInit {


  plans : any[] = [];

  constructor() { }

  ngOnInit(): void {
    // Chat Data Get Function
    this._fetchData();
    document.querySelectorAll(".annual").forEach((item)=>{
      item.setAttribute('style','display:none')
    })
  }

   // Chat Data Fetch
   private _fetchData() {
    this.plans = plans;
  }

  /**
   * Open modal
   * @param content modal content
   */
   
   check() {
    var checkBox = document.getElementById("plan-switch");
    var month = document.querySelectorAll(".month");
    var annual = document.querySelectorAll(".annual");

    
    annual.forEach((item)=>{
      if(item.getAttribute('style')=='display:none')
      {
        item.setAttribute('style','display:block')
      }else{
        item.setAttribute('style','display:none')
      }
    })
    month.forEach((item)=>{
      if(item.getAttribute('style')=='display:none')
      {
        item.setAttribute('style','display:block')
      }else{
        item.setAttribute('style','display:none')
      }
    });
    
  }

}
