import {  Component, EventEmitter, Input, Output  } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: false,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
 @Input() pageNumber: number = 1;
  @Input() totalPages: number = 0;

  @Output() pageChange = new EventEmitter<any>();

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }
}
