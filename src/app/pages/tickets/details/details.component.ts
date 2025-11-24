import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: false
})
export class DetailsComponent {
  @Input() ticket: any;

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open': return 'bg-success text-white';
      case 'Inprogress': return 'bg-warning text-white';
      case 'New': return 'bg-info text-white';
      case 'Closed': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'bg-danger text-white';
      case 'Medium': return 'bg-warning text-dark';
      case 'Low': return 'bg-success text-white';
      case 'Critical': return 'bg-dark text-white';
      default: return 'bg-secondary text-white';
    }
  }
}