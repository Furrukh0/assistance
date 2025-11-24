import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResponseCode } from 'src/app/core/consts/api.consts';
import { ResponseVM } from 'src/app/core/interfaces/api.interface';
import { ApiCallService } from 'src/app/core/services/api-call-service';
import { ToastService } from 'src/app/core/services/toast.service';

export interface DemoRequest {
  id: number;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  organizationName: string;
  remarks: string;
  meetingLink: string;
  requestedDate: string;
  scheduledDate: string | null;
  completedDate: string | null;
  status: string;
  assignedTo: string;
  isActive: boolean;
  deletedBy: string | null;
  deletedAt: string | null;
  totalRecords: number;
  assignedUserId: number | null;
  assignedUserName: string;
  assignedUserEmail: string;
}

export interface DemoPayload {
  id: number,
  requesterName: string,
  requesterEmail: string,
  requesterPhone: string,
  organizationName: string,
  remarks: string,
  meetingLink: string,
  requestedDate: string | null,
  scheduledDate: string | null,
  completedDate: string | null,
  status: string,
  assignedTo: string
}

export interface AssignedTo {
  id: number,
  userName: string,
  email: string
}


@Component({
  selector: 'app-demo-request',
  standalone: false,
  templateUrl: './demo-request.component.html',
  styleUrl: './demo-request.component.scss'
})
export class DemoRequestComponent implements OnInit {

  // Varaibles
  DemoRequests: DemoRequest[] = [];
  DemoRequestForm!: FormGroup;
  isEditMode: boolean = false;
  DemoToDelete: DemoRequest | null = null;
  AssignedToList: AssignedTo[] = [
    // {
    //   id: 1,
    //   userName: "Muhammad Nouman",
    //   userEmail: "nm.atgsystem@gmail.com"
    // },
    // {
    //   id: 2,
    //   userName: "Muhammad Hamad",
    //   userEmail: "mh.atgsystems@gmail.com"
    // },
    // {
    //   id: 3,
    //   userName: "Muhammad Ahmad",
    //   userEmail: "ma.atgsystems@gmail.com"
    // }
  ]
  private isFirstLoad: boolean = true;

  // Pagination Variables
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;

  //Searching and Filters
  showFilters: boolean = false;
  searchText: string | null = null;
  isActiveFilter: boolean | null = null;
  selectedFilterLabel: string = 'All';
  statusFilter: string = '';
  searchDebounceTimer: any;
  fromDate: string | null = null;
  toDate: string | null = null;
  toDateMin: string | Date | undefined;
  fromDateMax: string | Date | undefined;

  // Injected Services
  private readonly _apiCallService: ApiCallService = inject(ApiCallService);
  private readonly _modalService: NgbModal = inject(NgbModal);
  private readonly _toasterService: ToastService = inject(ToastService);

  constructor(private fb: FormBuilder) { }


  ngOnInit(): void {
    this.fetchDemoRequestsData();
    this.InitializeForm();
    this.getUserDropdown();
  }

  private InitializeForm() {
    this.DemoRequestForm = this.fb.group({
      id: [0],
      requesterName: ['', [Validators.required, Validators.minLength(3)]],
      requesterEmail: ['', [Validators.required, Validators.email]],
      requesterPhone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{7,15}$/)]],
      organizationName: ['', [Validators.required]],
      remarks: [''],
      meetingLink: [''],
      requestedDate: [null, [Validators.required]],
      scheduledDate: [null],
      completedDate: [null],
      status: ['', [Validators.required]],
      assignedTo: ['']
    });
  }

  public OpenModal(content: any, demoReq: DemoRequest, mode: boolean) {
    this.isEditMode = mode;
    this.DemoRequestForm.reset();
    const mapped: DemoPayload = {
      id: demoReq.id,
      requesterName: demoReq.requesterName,
      requesterEmail: demoReq.requesterEmail,
      requesterPhone: demoReq.requesterPhone,
      organizationName: demoReq.organizationName,
      remarks: demoReq.remarks,
      meetingLink: demoReq.meetingLink,
      requestedDate: this.formatDateForInput(demoReq.requestedDate),
      scheduledDate: this.formatDateForInput(demoReq.scheduledDate),
      completedDate: this.formatDateForInput(demoReq.completedDate),
      status: demoReq.status,
      assignedTo: demoReq.assignedTo
    };

    this.DemoRequestForm.patchValue(mapped);

    if (!this.isEditMode) {
      this.DemoRequestForm.disable();
    } else {
      this.DemoRequestForm.enable();
    }
    this._modalService.open(content, { size: 'lg', centered: true });
  }


  public fetchDemoRequestsData() {
    const payload = {
      pageNumber: this.pageNumber,
      pageSize: 10,
      searchText: this.searchText == null ? '' : this.searchText,
      status: this.statusFilter,
      fromDate: this.fromDate ? this.formatDateForInput(this.fromDate)?.substring(0, 10) : null,
      toDate: this.toDate ? this.formatDateForInput(this.toDate)?.substring(0, 10) : null,
      isDemoCompleted: null,
      isActive: this.isActiveFilter,
      isDeleted: false,
      sortBy: "addedDate",
      sortOrder: "desc"
    }
    this._apiCallService.PostCall(payload, 'demo/GetAllDemoRequests').subscribe((response: ResponseVM) => {
      if (response.responseCode == ResponseCode.Success) {
        if (response.data && response.data.records.length > 0) {
          this.DemoRequests = response.data.records;
          this.totalRecords = response.data.pagination?.totalRecords;
          this.totalPages = response.data.pagination?.totalPages;
        } else {
          this.DemoRequests = [];
          this.totalPages = 0;
          this.totalRecords = 0;
        }
        if (this.isFirstLoad) {
          this._toasterService.success(response.responseMessage);
          this.isFirstLoad = false;
        }
      } else {
        this.DemoRequests = [];
        this.totalPages = 0;
        this.totalRecords = 0;
      }
    })
  }

  private getUserDropdown() {
    this._apiCallService.GetCall('DropDown/GetUsersDropdown').subscribe((response: ResponseVM) => {
      if (response.responseCode == ResponseCode.Success) {
        this.AssignedToList = response.data;
      }
    })
  }

  public UpdateStatus(id: number, oldStatus: string, newStatus: string) {
    if (oldStatus == newStatus) {
      return;
    } else {
      this._apiCallService.PostCall(null, `demo/status/${id}?status=${newStatus}`).subscribe((response: ResponseVM) => {
        if (response.responseCode == ResponseCode.Success) {
          this._toasterService.success(response.responseMessage);
          this.fetchDemoRequestsData();
        }
      })
    }
  }

  public UpdateAssignTo(id: number, userId: number | null, userEmail: string, userName: string) {
    debugger
    if (!id || !userId) {
      this._toasterService.error("Assiging User Id not coorect");
    }
    this._apiCallService.PostCall(null, `demo/assign/${id}?assignedToId=${userId}&assignedToEmail=${userEmail}&assignedToName=${userName}`).subscribe((response: ResponseVM) => {
      if (response.responseCode == ResponseCode.Success) {
        this._toasterService.success(response.responseMessage);
        this.fetchDemoRequestsData();
      }
    })
  }

  onActiveToggle(demoid: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    this._apiCallService.PatchCall(null, `demo/isactive/${demoid}?isActive=${isChecked}`)
      .subscribe((response: ResponseVM) => {
        if (response.responseCode == ResponseCode.Success) {
          this._toasterService.success(response.responseMessage);
          this.fetchDemoRequestsData();
        }
      });
  }

  DeleteDemoModal(content: TemplateRef<any>, demoToDel: DemoRequest) {
    this.DemoToDelete = demoToDel;
    this._modalService.open(content, { size: 'md', centered: true });
  }


  DeleteDemoRequest() {
    this._apiCallService.DeleteCall(`demo/${this.DemoToDelete?.id}`).subscribe((response: ResponseVM) => {
      if (response.responseCode == ResponseCode.Success) {
        this._toasterService.success(response.responseMessage);
        this.DemoToDelete = null;
        this.fetchDemoRequestsData();
        this._modalService.dismissAll();
      }
    })
  }

  onSubmit() {
    this.DemoRequestForm.markAllAsTouched();
    if (this.DemoRequestForm.invalid) {
      return;
    }
    const payload: DemoPayload = this.DemoRequestForm.value;
    this._apiCallService.PostCall(payload, 'demo/updateDemoRequest').subscribe((response: ResponseVM) => {
      if (response.responseCode == ResponseCode.Success) {
        this._toasterService.success(response.responseMessage);
        this.fetchDemoRequestsData();
        this._modalService.dismissAll();
      }
    })
  }


  hasError(control: string, error: string): boolean {
    return this.DemoRequestForm.get(control)?.hasError(error) &&
      (this.DemoRequestForm.get(control)?.touched || this.DemoRequestForm.get(control)?.dirty) || false;
  }
  private formatDateForInput(dateStr: string | null): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  onFromDateChange(selected: string) {
    this.fromDate = selected;
    this.toDateMin = selected || undefined;
    if (this.toDate && new Date(this.toDate) < new Date(this.fromDate)) {
      this.toDate = null;
    }
  }

  onToDateChange(selected: string) {
    this.toDate = selected;
    this.fromDateMax = selected || undefined;
    if (this.fromDate && new Date(this.fromDate) > new Date(this.toDate)) {
      this.fromDate = null;
    }
  }


  changePage(page: number) {
    this.pageNumber = page;
    this.fetchDemoRequestsData();
  }


  //Toggle Filters 
  toggleFilters() {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.resetFilters();
    }
  }

  //Searching
  onSearchChanged(event: any) {
    const value = event.target.value.trim();

    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.searchText = value ? value : null;
    }, 500);
  }

  //Active filter
  onFilterChanged(value: boolean | null) {
    this.isActiveFilter = value;
    if (value == null) {
      this.selectedFilterLabel = 'All'
    } else if (value == true) {
      this.selectedFilterLabel = 'Active'
    } else if (value == false) {
      this.selectedFilterLabel = 'Inactive'
    }

  }
  onStatusFilterChanged(value: string) {
    this.statusFilter = value;
  }

  //Reset Filters
  resetFilters() {
    this.isActiveFilter = null;
    this.searchText = null;
    this.fromDate = null;
    this.toDate = null;
    this.searchText = '';
    this.statusFilter = '';
    this.fetchDemoRequestsData();
  }

  searchDemoRequests() {
    this.pageNumber = 1;
    this.fetchDemoRequestsData();
  }

}
