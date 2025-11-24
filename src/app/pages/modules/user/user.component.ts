import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiCallService } from 'src/app/core/services/api-call-service';
import { ResponseVM } from 'src/app/core/interfaces/api.interface';
import { ResponseCode } from 'src/app/core/consts/api.consts';
import { ToastService } from 'src/app/core/services/toast.service';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  gender: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  password?: string;
  Status?: string;
  totalRecords?: number;
}



@Component({
  selector: 'app-user',
  standalone: false,
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  @Input() selectedUser: User | null = null;
  private isFirstLoad: boolean = true;

  // Form
  userForm!: FormGroup;
  isEditMode = false;

  // Variables
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;
  User: User[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', userName: 'johndoe', gender: 'Male', email: 'john.doe@example.com', phoneNumber: '+923001234567', dateOfBirth: '1990-05-12', address: '123 Main St, Lahore', Status: 'Active' },
    { id: 2, firstName: 'Sarah', lastName: 'Khan', userName: 'sarahk', gender: 'Female', email: 'sarah.khan@example.com', phoneNumber: '+923112345678', dateOfBirth: '1995-08-21', address: '45 Model Town, Karachi', Status: 'Active' },
    { id: 3, firstName: 'Ali', lastName: 'Raza', userName: 'aliraza', gender: 'Male', email: 'ali.raza@example.com', phoneNumber: '+923221234567', dateOfBirth: '1988-01-10', address: '78 Gulberg, Islamabad', Status: 'Inactive' },
    { id: 4, firstName: 'Maria', lastName: 'Sheikh', userName: 'marias', gender: 'Female', email: 'maria.s@example.com', phoneNumber: '+923331234567', dateOfBirth: '1992-03-05', address: '12 Clifton, Karachi', Status: 'Pending' },
    { id: 5, firstName: 'Ahmed', lastName: 'Butt', userName: 'ahmedb', gender: 'Male', email: 'ahmed.b@example.com', phoneNumber: '+923451234567', dateOfBirth: '1993-07-14', address: '9 DHA, Lahore', Status: 'Active' }

  ];

  userToDelete: User | null = null;
  private modalRef!: NgbModalRef;

  //Searching and Filters
  showFilters: boolean = false;
  searchText: string | null = null;
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
    // this.fetchUsersData();
    this.totalPages = 2;
    this.totalRecords = 10;
  }

  private buildForm() {
    this.userForm = this.fb.group({
      id: [0],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{7,15}$/)]],
      dateOfBirth: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.minLength(6)]]
    });
  }


  // Fetch Users Data

  private fetchUsersData() {
    const payload = {
      pageSize: this.pageSize,
      pageNumber: this.pageNumber,
      search: this.searchText,
      getName: "All",
    }
    this._apiCallService.PostCall(payload, "User/GetAllUsers").subscribe((response: ResponseVM) => {
      if (response.responseCode == ResponseCode.Success) {
        if (response.data && response.data.records.length > 0) {

          this.User = response.data.records;
          this.totalPages = response.data.pagination.totalPages;
          this.totalRecords = response.data.pagination.totalRecords;
        } else {
          this.User = [];
          this.totalPages = 0;
          this.totalRecords = 0;
        }
        if (this.isFirstLoad) {
          this._toasterService.success(response.responseMessage);
          this.isFirstLoad = false;
        }
      } else {
        this.User = [];
        this.totalPages = 0;
        this.totalRecords = 0;
        this._toasterService.error(response.errorMessage);
      }
    })
  }

  // Submit (Add/Update User)
  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload: User = this.userForm.value;

    if (this.isEditMode && payload.password === '******') {
      delete (payload as any).password;
    }

    if (this.isEditMode && this.selectedUser) {
      const isUnchanged = Object.keys(payload).every(
        key => (payload as any)[key] === (this.selectedUser as any)[key]
      );

      if (isUnchanged) {
        this._toasterService.info("No changes detected");
        return;
      }
    }
    if (this.isEditMode) {
      const index = this.User.findIndex(u => u.id === payload.id);
      if (index !== -1) {
        this.User[index] = payload;
        this._toasterService.success('Update Successfully');
      }
    } else {
      this.User.push(payload);
      this._toasterService.success('Added Successfully');
    }
    this.modalRef.close();

    // const urlStr = this.isEditMode == true ? `User/UpdateUserDetail` : `User/CreateUser`;
    // this._apiCallService.PostCall(payload, urlStr).subscribe((response: ResponseVM) => {
    //   if (response.responseCode == ResponseCode.Success) {
    //     this._toasterService.success(response.responseMessage);
    //     this.fetchUsersData();
    //     this.modalRef.close();
    //   } else {
    //     this._toasterService.error(response.errorMessage);
    //   }
    // });

  }

  // Delete Organization
  deleteUser(modal: NgbModalRef) {
    if (!this.userToDelete) return;


    this.User = this.User.filter(u => u.id !== this.userToDelete?.id);
    this._toasterService.success('Deleted Successfully');
    modal.close();

    // this._apiCallService.DeleteCall(`User/DeleteUser/${this.userToDelete.id}`)
    //   .subscribe((response: ResponseVM) => {
    //     if (response.responseCode == ResponseCode.Success) {
    //       this._toasterService.success(response.responseMessage);
    //       this.fetchUsersData();
    //     } else {
    //       this._toasterService.error(response.errorMessage);
    //     }
    //     modal.close();
    //   });
  }


  // Open Modal (Add)
  openAddUserModal(content: any) {
    this.isEditMode = false;
    this.userForm.reset({
      id: 0,
      firstName: '',
      lastName: '',
      userName: '',
      gender: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      address: '',
      Status: '',
    });
    this.modalRef = this._modalService.open(content, { size: 'lg' });
  }

  // Open Modal (Edit)
  openEditUserModal(content: any, user: User) {
    this.isEditMode = true;

    const mapped: User = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      gender: user.gender,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      password: '******',
      Status: user.Status,
      totalRecords: user.totalRecords,
    };
    this.selectedUser = mapped;
    this.userForm.patchValue(mapped);
    this.modalRef = this._modalService.open(content, { size: 'lg' });
  }

  // Open Delete Confirmation Modal
  openDeleteUserModal(content: any, user: User) {
    this.userToDelete = user;
    this.modalRef = this._modalService.open(content, { centered: true });
  }


  // Validation Helpers
  hasError(control: string, error: string): boolean {
    return this.userForm.get(control)?.hasError(error) &&
      (this.userForm.get(control)?.touched || this.userForm.get(control)?.dirty) || false;
  }

  // Pagination Helper
  changePage(page: number) {
    this.pageNumber = page;
    this.fetchUsersData();
  }

  //Toggle Filters
  toggleFilters() {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.resetFilters();
    }
  }

  // Search Input 
  onSearchChanged(event: any) {
    const value = event.target.value.trim();
    this.searchText = value ? value : null;
  }

  // Search Button 
  onSearch() {
    this.pageNumber = 1;
    this.fetchUsersData();
  }

  //Reset Filters
  resetFilters() {
    if (this.searchText !== null) {
      this.searchText = null;
      this.pageNumber = 1;
      this.fetchUsersData();
    }
  }

}