import { Component, OnInit } from '@angular/core';
import { SectorSolutions } from './data';

@Component({
  selector: 'app-designed',
  templateUrl: './designed.component.html',
  styleUrls: ['./designed.component.scss'],
  standalone: false
})

/**
 * Designed Component
 */
export class DesignedComponent implements OnInit {

  SectorSolutions: {
    title: string
  }[] = [];
  constructor() { }

  ngOnInit(): void {
    this.fetchData();
  }


  fetchData() {
    this.SectorSolutions = SectorSolutions;
  }
}
