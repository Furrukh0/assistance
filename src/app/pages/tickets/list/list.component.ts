import { Component } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { restApiService } from "../../../core/services/rest-api.service";
import { RootReducerState } from 'src/app/store';
import { Store } from '@ngrx/store';
import { addTicket, deleteTicket, fetchTicketListData, updateTicket } from 'src/app/store/Ticket/ticket_action';
import { selectTicketData, selectTicketLoading } from 'src/app/store/Ticket/ticket_selector';
import { cloneDeep } from 'lodash';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TicketListModel } from 'src/app/store/Ticket/ticket_model';
import { ApiCallService } from 'src/app/core/services/api-call-service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false
})
export class ListComponent {
  breadCrumbItems!: Array<{}>;
  ordersForm!: UntypedFormGroup;
  CustomersData!: TicketListModel[];
  masterSelected!: boolean;
  checkedList: any;
  submitted = false;

  content?: any;
  lists?: any = [];
  econtent?: any;
  alllists: any;
  searchResults: any;
  searchTerm: any = '';
  date: any;
  status: any = '';

  usersList: any[] = [];
  filteredUsers: any[] = [];
  dropdownOpen = false;

  // Drawer properties
  selectedTicket: any = null;
  isDrawerOpen: boolean = false;

  constructor(
    private modalService: NgbModal,
    public service: PaginationService,
    private restApiService: restApiService,
    private formBuilder: UntypedFormBuilder,
    private store: Store<{ data: RootReducerState }>,
    private datePipe: DatePipe,
    private apiCallService: ApiCallService,

  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Invoices' },
      { label: 'Invoice List', active: true }
    ];
    document.getElementById('elmLoader')?.classList.add('d-none');

    this.ordersForm = this.formBuilder.group({
      id: [''],
      ids: [''],
      title: ['', [Validators.required]],
      client: ['', [Validators.required]],
      assigned: ['', [Validators.required]],
      assignedUserName: [''],
      create: ['', [Validators.required]],
      due: ['', [Validators.required]],
      status: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      fileUrl: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });

    this.store.dispatch(fetchTicketListData());
    this.store.select(selectTicketLoading).subscribe((data) => {
      if (data == false) {
        document.getElementById('elmLoader')?.classList.add('d-none');
      }
    });

    this.store.select(selectTicketData).subscribe((data) => {
      this.lists = data;
      this.alllists = cloneDeep(data);
      this.lists = this.service.changePage(this.alllists)
    });
  }

  num: number = 0;
  option = {
    startVal: this.num,
    useEasing: true,
    duration: 2,
    decimalPlaces: 2,
  };

  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  deleteData(id: any) {
    if (id) {
      this.store.dispatch(deleteTicket({ id: this.deleteId.toString() }));
    } else {
      this.store.dispatch(deleteTicket({ id: this.checkedValGet.toString() }));
    }
    this.deleteId = ''
    this.masterSelected = false;
    this.store.dispatch(fetchTicketListData());
    this.store.select(selectTicketLoading).subscribe((data) => {
      if (data == false) {
        document.getElementById('elmLoader')?.classList.add('d-none');
      }
    });
  }

  checkedValGet: any[] = [];
  deleteMultiple(content: any) {
    var checkboxes: any = document.getElementsByName('checkAll');
    var result
    var checkedVal: any[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    if (checkedVal.length > 0) {
      this.modalService.open(content, { centered: true });
    }
    else {
      Swal.fire({ text: 'Please select at least one checkbox', confirmButtonColor: '#299cdb', });
    }
    this.checkedValGet = checkedVal;
  }

  checkUncheckAll(ev: any) {
    this.lists.forEach((x: { state: any; }) => x.state = ev.target.checked)
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.lists.length; i++) {
      if (this.lists[i].state == true) {
        result = this.lists[i];
        checkedVal.push(result);
      }
    }
    this.checkedValGet = checkedVal
    checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";
  }

  onCheckboxChange(e: any) {
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.lists.length; i++) {
      if (this.lists[i].state == true) {
        result = this.lists[i];
        checkedVal.push(result);
      }
    }
    this.checkedValGet = checkedVal
    checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";
  }


  getUserList() {
    this.restApiService.getUsersList().subscribe((res: any) => {
      this.usersList = res.data;
      this.filteredUsers = [...this.usersList];
    });
  }
  openModal(content: any) {
    this.submitted = false;
    this.getUserList();
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  get form() {
    return this.ordersForm.controls;
  }

  ticketFields = ['ids', 'assignedUserName', 'fileUrl'];
  removeUnusedControls() {
    this.ticketFields.forEach(field => {
      if (this.ordersForm.contains(field)) {
        this.ordersForm.removeControl(field);
      }
    });
  }

  enableDisabledControls() {
    this.ticketFields.forEach(field => {
      this.ordersForm.get(field)?.enable();
    });
  }


  // Call it in submit
  submit() {
    this.removeUnusedControls();

    if (this.ordersForm.valid) {
      console.log(this.ordersForm.value);
    }
  }



  saveUser() {
    debugger
    this.removeUnusedControls();
    console.log(this.ordersForm.value)
    if (this.ordersForm.valid) {
      this.enableDisabledControls();
      if (this.ordersForm.get('id')?.value) {
        const updatedData = this.ordersForm.value;
        this.store.dispatch(updateTicket({ updatedData }));
      }
      else {
        const ticketId = (this.alllists.length + 1).toString();
        this.ordersForm.controls['id'].setValue(ticketId);
        const newData = this.ordersForm.value;
        this.store.dispatch(addTicket({ newData }));
        // this.restApiService.postTicketData(newData).subscribe((res) => {
        //   console.log(res);
        // })
        // let timerInterval: any;
        // Swal.fire({
        //   title: 'Ticket Created successfully!',
        //   icon: 'success',
        //   timer: 2000,
        //   timerProgressBar: true,
        //   willClose: () => {
        //     clearInterval(timerInterval);
        //   },
        // }).then((result) => {
        //   if (result.dismiss === Swal.DismissReason.timer) {
        //   }
        // });
      }
    }
    setTimeout(() => {
      this.store.dispatch(fetchTicketListData());
    }, 2000);
    // this.store.select(selectTicketLoading).subscribe((data) => {
    //   if (data == false) {
    //     document.getElementById('elmLoader')?.classList.add('d-none');
    //   }
    // });
    this.modalService.dismissAll();
    this.ordersForm.reset();
    this.submitted = true
  }

  editDataGet(id: any, content: any) {
    this.getUserList();
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Ticket';
    var updateBtn = document.getElementById('add-btn') as HTMLAreaElement;
    updateBtn.innerHTML = "Update";
    this.econtent = this.alllists[id];
    this.ordersForm.controls['id'].setValue(this.econtent.id);
    this.ordersForm.controls['title'].setValue(this.econtent.title);
    this.ordersForm.controls['client'].setValue(this.econtent.client);
    this.ordersForm.controls['assigned'].setValue(this.econtent.assigned);
    this.ordersForm.controls['create'].setValue(this.econtent.create);
    this.ordersForm.controls['due'].setValue(this.econtent.due);
    this.ordersForm.controls['status'].setValue(this.econtent.status);
    this.ordersForm.controls['priority'].setValue(this.econtent.priority);
    this.ordersForm.controls['fileUrl'].setValue(this.econtent.fileUrl);
    this.ordersForm.controls['description'].setValue(this.econtent.description);
    this.ordersForm.controls['ids'].setValue(this.econtent._id);
  }

  buildPayload(): any {
    return {
      filter: {
        id: 0,
        pageNumber: this.service.page || 1,
        pageSize: this.service.pageSize || 10,
        searchText: this.searchTerm && this.searchTerm.trim() !== '' ? this.searchTerm : null,
        createDate: null,
        dueDate: null,
        status: this.status && this.status.trim() !== '' ? this.status : null
      }
    };
  }

  performSearch(): void {
    const payload = this.buildPayload();
    document.getElementById('elmLoader')?.classList.remove('d-none');
    this.restApiService.getTicketData(payload).subscribe(
      (res: any) => {
        const rawData = res.data || [];
        this.searchResults = rawData.map((item: any) => ({
          id: item.id,
          title: item.title,
          client: item.client,
          assigned: item.assignedTo,
          create: item.createDate,
          due: item.dueDate,
          status: this.mapStatus(item.status),
          priority: item.priority,
          fileUrl: item.fileUrl,
          description: item.description,
          _id: item.id
        }));
        this.lists = this.service.changePage(this.searchResults);
        document.getElementById('elmLoader')?.classList.add('d-none');
      },
      () => {
        document.getElementById('elmLoader')?.classList.add('d-none');
      }
    );
  }

  mapStatus(status: string): string {
    if (!status) return '';
    switch (status.trim().toLowerCase()) {
      case 'completed': return 'Closed';
      case 'in progress': return 'Inprogress';
      case 'to do': return 'New';
      case 'open': return 'Open';
      default: return status;
    }
  }

  SearchData() {
    this.performSearch();
  }

  statusFilter() {
    this.performSearch();
  }

  onDateChange() {
    this.performSearch();
  }

  changePage() {
    this.performSearch();
  }

  onSort(column: any) {
    this.lists = this.service.onSort(column, this.lists)
  }

  toggleDropdown() {
    this.dropdownOpen = true;
  }

  searchUser(event: any) {
    const searchText = event.target.value.toLowerCase();
    this.dropdownOpen = true;
    this.filteredUsers = this.usersList.filter((user) =>
      user.fullName.toLowerCase().includes(searchText)
    );
  }

  selectUser(user: any) {
    this.ordersForm.controls['assigned'].setValue(user.fullName);
    this.ordersForm.controls['assignedUserName'].setValue(user.userName);
    this.dropdownOpen = false;
  }

  // Drawer Methods
  viewTicket(ticket: any) {
    this.selectedTicket = {
      id: ticket.id,
      title: ticket.title,
      client: ticket.client,
      assignedTo: ticket.assignedTo || ticket.assigned,
      createDate: ticket.createDate || ticket.create,
      dueDate: ticket.dueDate || ticket.due,
      status: this.mapStatus(ticket.status),
      statusRaw: ticket.status,
      priority: ticket.priority,
      fileUrl: ticket.fileUrl,
      description: ticket.description
    };
    this.openDrawer();
  }

  openDrawer() {
    this.isDrawerOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    document.body.style.overflow = 'auto'; // Restore body scroll
    this.selectedTicket = null;
  }

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

  updateWorkUrl() {
    if (!this.selectedTicket) return;
    const payload = {
      id: this.selectedTicket.id || 0,
      title: this.selectedTicket.title,
      client: this.selectedTicket.client,
      assignedTo: this.selectedTicket.assignedTo,
      createDate: this.selectedTicket.createDate,
      dueDate: this.selectedTicket.dueDate,
      status: this.selectedTicket.status,
      priority: this.selectedTicket.priority,
      fileUrl: this.selectedTicket.fileUrl,
      description: this.selectedTicket.description
    };
    this.apiCallService.PostCall(payload, 'UserTicket/CreateOrUpdateTicket').subscribe({
      next: () => {
        this.closeDrawer();
        this.performSearch(); // Refresh ticket list after update
      },
      error: () => {
        // Optionally show error message
      }
    });
  }
}