import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cta',
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.scss'],
  standalone: false
})

/**
 * Cta Component
 */
export class CtaComponent implements OnInit {
  @Input() Data: any;

  constructor() { }

  ngOnInit(): void {
  }

}
