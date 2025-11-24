import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ResponseCode } from 'src/app/core/consts/api.consts';
import { ResponseVM } from 'src/app/core/interfaces/api.interface';
import { ApiCallService } from 'src/app/core/services/api-call-service';
import { ToastService } from 'src/app/core/services/toast.service';

export interface Organization {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  DeletedBy: string | null;
  DeletedAt: string | null;
  TotalRecords: number;
}

export interface OrganizationPayload {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
}

@Component({
  selector: 'app-organization',
  standalone: false,
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss'
})
export class OrganizationComponent implements OnInit {

  @Input() selectedOrg: OrganizationPayload | null = null;
  private isFirstLoad: boolean = true;

  // Form
  organizationForm!: FormGroup;
  isEditMode = false;

  // Varaibles
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;
  Organization: Organization[] = [];
  orgToDelete: Organization | null = null;
  private modalRef!: NgbModalRef;

  //Searching and Filters
  showFilters: boolean = false;
  searchText: string | null = null;
  isActiveFilter: boolean | null = null;
  selectedFilterLabel: string = 'All';
  searchDebounceTimer: any;

  constructor() { }

  // Injected Services
  private readonly _apiCallService: ApiCallService = inject(ApiCallService);
  private readonly _modalService: NgbModal = inject(NgbModal);
  private readonly _toasterService: ToastService = inject(ToastService)
  private readonly fb: FormBuilder = inject(FormBuilder);



  ngOnInit(): void {
    this.buildForm();
    this.fetchOrganizationsData();
  }

  private buildForm() {
    this.organizationForm = this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      isActive: [true]
    });
  }

  // Fetch Prganizations
  private fetchOrganizationsData() {
    const payload = {
      pageSize: this.pageSize,
      pageNumber: this.pageNumber,
      search: this.searchText,
      isActive: this.isActiveFilter
    };

    this._apiCallService.PostCall(payload, 'organization/get-all').subscribe((response: ResponseVM) => {
      if (response.responseCode == ResponseCode.Success) {
        if (response.data && response.data.records.length > 0) {
          this.Organization = response.data.records;
          this.totalPages = response.data.pagination.totalPages;
          this.totalRecords = response.data.pagination.totalRecords;
        } else {
          this.Organization = [];
          this.totalPages = 0;
          this.totalRecords = 0;
        }

        if (this.isFirstLoad) {
          this._toasterService.success(response.responseMessage);
          this.isFirstLoad = false;
        }
      } else {
        this.Organization = [];
        this.totalPages = 0;
        this.totalRecords = 0;
      }
    });
  }


  // Open Modal (Add)
  openAddOrganizationModal(content: any) {
    this.isEditMode = false;
    this.organizationForm.reset({
      id: 0,
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      isActive: true
    });
    this.modalRef = this._modalService.open(content, { size: 'lg' });
  }

  // Open Modal (Edit)
  openEditOrganizationModal(content: any, org: Organization) {
    this.isEditMode = true;

    const mapped: OrganizationPayload = {
      id: org.id,
      name: org.name,
      code: org.code,
      address: org.address,
      phone: org.phone,
      email: org.email,
      isActive: org.isActive
    };
    this.selectedOrg = mapped;
    this.organizationForm.patchValue(mapped);
    this.modalRef = this._modalService.open(content, { size: 'lg' });
  }

  // Open Delete Confirmation Modal
  openDeleteModal(content: any, org: Organization) {
    this.orgToDelete = org;
    this.modalRef = this._modalService.open(content, { centered: true });
  }

  // Submit (Add/Update)
  onSubmit() {
    if (this.organizationForm.invalid) {
      this.organizationForm.markAllAsTouched();
      return;
    }

    const payload: OrganizationPayload = this.organizationForm.value;

    if (this.isEditMode && this.selectedOrg) {
      const isUnchanged = Object.keys(payload).every(
        key => (payload as any)[key] === (this.selectedOrg as any)[key]
      );

      if (isUnchanged) {
        this._toasterService.info("No changes detected");
        return;
      }
    }

    const urlStr = this.isEditMode == true ? `organization/update/${payload.id}` : `organization`;
    this._apiCallService.PostCall(payload, urlStr).subscribe((response: ResponseVM) => {
      if (response.responseCode == ResponseCode.Success) {
        this._toasterService.success(response.responseMessage);
        this.fetchOrganizationsData();
        this.modalRef.close();
      } else {
        this._toasterService.error(response.errorMessage);
      }
    });

  }

  // Delete Organization
  deleteOrganization(modal: NgbModalRef) {
    if (!this.orgToDelete) return;

    this._apiCallService.DeleteCall(`organization/${this.orgToDelete.id}`)
      .subscribe((response: ResponseVM) => {
        if (response.responseCode == ResponseCode.Success) {
          this._toasterService.success(response.responseMessage);
          this.fetchOrganizationsData(); 
        } else {
          this._toasterService.error(response.errorMessage);
        }
        modal.close();
      });
  }

  // Toggle Organization status
  toggleOrganizationStatus(org: any) {
    this._apiCallService.PatchCall(null, `organization/${org.id}/status?isActive=${!org.isActive}`)
      .subscribe((response: ResponseVM) => {
        if (response.responseCode == ResponseCode.Success) {
          this._toasterService.success(response.responseMessage);
          org.isActive = !org.isActive;
        } else {
          this._toasterService.error(response.errorMessage);
        }
      });
  }


  // Validation Helper
  hasError(control: string, error: string): boolean {
    return this.organizationForm.get(control)?.hasError(error) &&
      (this.organizationForm.get(control)?.touched || this.organizationForm.get(control)?.dirty) || false;
  }

  // Pagination Helper
  changePage(page: number) {
    this.pageNumber = page;
    this.fetchOrganizationsData();
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
      this.pageNumber = 1;
      this.fetchOrganizationsData();
    }, 500);
  }

  //Active filter
  onFilterChanged(value: string) {
    this.isActiveFilter = value === '' ? null : (value === 'true');

    // update button label
    if (value === '') this.selectedFilterLabel = 'All';
    else if (value === 'true') this.selectedFilterLabel = 'Active';
    else this.selectedFilterLabel = 'Inactive';

    this.pageNumber = 1;
    this.fetchOrganizationsData();
  }

  //Reset Filters
  resetFilters() {
    this.isActiveFilter = null;
    this.searchText = null;
    this.fetchOrganizationsData();
  }

}
