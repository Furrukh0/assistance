import { Component, inject, TemplateRef } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { teamModel } from './team.model';
import { Team } from 'src/app/core/data';
import { ApiCallService } from 'src/app/core/services/api-call-service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ResponseVM } from 'src/app/core/interfaces/api.interface';
import { ResponseCode } from 'src/app/core/consts/api.consts';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  gender: 'Male' | 'Female' | '';
  userEmail: string;
  phoneNumber: string;
  profileImageUrl?: string;
  gradient?: string;
  isActive?: boolean;
}


export interface UserPayload {
  id?: number;
  firstName: string;
  lastName: string;
  userName: string;
  gender: 'Male' | 'Female' |  '';
  userEmail: string;
  phoneNumber: string;
  profileImageUrl?: File | null;
  coverImage?: File | null;
}



@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  standalone: false
})
export class TeamComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  // Form
  userForm!: FormGroup;
  isEditMode = false;

  // Variables
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;
  Users!: User[];
  Team!: teamModel[];
  submitted = false;
  term: any;
  editMode = false;
  selectedTeamId: string | null = null;
  selectedUser: UserPayload | null = null;

  //Searching and Filters
  showFilters: boolean = false;
  searchText: string | null = null;
  isActiveFilter: boolean | null = null;
  selectedFilterLabel: string = 'All';
  searchDebounceTimer: any;

  constructor(private modalService: NgbModal,) { }

  private readonly _apiCallService: ApiCallService = inject(ApiCallService);
  private readonly _modalService: NgbModal = inject(NgbModal);
  private readonly _toasterService: ToastService = inject(ToastService);
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly offcanvasService: NgbOffcanvas = inject(NgbOffcanvas);

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Pages' },
      { label: 'Team', active: true }
    ];

    this.buildForm();
    this.fetchUsers();
  }

  private buildForm() {
    this.userForm = this.fb.group({
      id: [0],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      gender: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{11,15}$/)]],
      profileImageUrl: [''],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', this.isEditMode ? [] : [Validators.required]]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  // Fetch User
  private fetchUsers() {

    // this.Users = this.usersData;

    // const payload = {
    //   pageSize: this.pageSize,
    //   pageNumber: this.pageNumber,
    //   search: this.searchText,
    //   isActive: this.isActiveFilter
    // };

    this._apiCallService.GetCall('ApplicationUser/GetUsers').subscribe((response: ResponseVM) => {
      if (response.responseCode == ResponseCode.Success) {
        // response.data && response.data.records.length > 0
        if (response.data && response.data.length > 0) {
          console.log("Responce:", response.data);
          this.Users = response.data;
          console.log("Users:", this.Users);
          // this.totalPages = response.data.pagination.totalPages;
          // this.totalRecords = response.data.pagination.totalRecords;
        } else {
          this.Users = [];
          this.totalPages = 0;
          this.totalRecords = 0;
        }
      } else {
        this.Users = [];
        this.totalPages = 0;
        this.totalRecords = 0;
      }
    });
  }

  // Submit User (Add/Update)
  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = this.userForm.value;

    // Edit Case
    if (this.isEditMode && this.selectedUser) {
      payload.id = this.selectedUser.id;

      const isUnchanged = Object.keys(payload).every(
        key => (payload as any)[key] === (this.selectedUser as any)[key]
      );

      if (isUnchanged) {
        this._toasterService.info("No changes detected");
        return;
      }
    } else {
      payload.id = 0;
    }

    this._apiCallService.PostCall(payload, `ApplicationUser/CreateOrUpdateUser`)
      .subscribe((response: ResponseVM) => {
        if (response.responseCode === ResponseCode.Success) {
          this._toasterService.success(response.responseMessage);
          this.fetchUsers();
          this._modalService.dismissAll();
        } else {
          this._toasterService.error(response.errorMessage);
        }
      });
  }

  passwordMatchValidator(form: any) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
  }


  // Delete User
  deleteUser() {
    if (this.selectedUser) {
      // this.Team = this.Team.filter(t => t.id !== this.selectedTeamId);
      // this._toasterService.info('Team member deleted');

      this._apiCallService.DeleteCall(`ApplicationUser/DeleteUser/${this.selectedUser}`)
        .subscribe((response: ResponseVM) => {
          if (response.responseCode == ResponseCode.Success) {
            this._toasterService.success(response.responseMessage);
            this.fetchUsers();
          } else {
            this._toasterService.error(response.errorMessage);
          }
          this._modalService.dismissAll();
        });
    }
  }

  openAddUserModal(content: any) {
  this.isEditMode = false;
  this.selectedUser = null;

  this.userForm.reset({
    id: 0,
    firstName: '',
    lastName: '',
    userName: '',
    gender: '',
    userEmail: '',
    phoneNumber: '',
    profileImageUrl: '',
    password: '',
    confirmPassword: ''
  });

  this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
  this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
  this.userForm.get('password')?.updateValueAndValidity();
  this.userForm.get('confirmPassword')?.updateValueAndValidity();

  this._modalService.open(content, { size: 'md', centered: true });
}


  passwordVisibility = {
    password: false,
    confirmPassword: false
  };

  toggleVisibility(field: 'password' | 'confirmPassword') {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }



  // Open Add
  openEditUserModal(content: any, user: any) {
    this.isEditMode = true;

    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    const mapped: any = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      gender: user.gender || 'Select Gender',
      userEmail: user.userEmail,
      phoneNumber: user.phoneNumber,
      profileImageUrl: user.profileImageUrl,
      password: '',
      confirmPassword: ''
    };

    this.selectedUser = mapped;
    this.userForm.patchValue(mapped);
    this._modalService.open(content, { size: 'md', centered: true });
  }



  // Open Delete Confirmation Modal
  openDeleteUserModal(content: any, id: any) {
    this.selectedUser = id;
    this._modalService.open(content, { centered: true });
  }


  // Validation Helper
  hasError(control: string, error: string): boolean {
    return this.userForm.get(control)?.hasError(error) &&
      (this.userForm.get(control)?.touched || this.userForm.get(control)?.dirty) || false;
  }

  //Active Toggle navbar
  activeMenu(id: any) {
    document.querySelector('.star_' + id)?.classList.toggle('active');
  }

  // File Upload 
  imageURL: string | null = null;
  selectedFileBase64: string | null = null;
  fileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const base64String = e.target.result as string;
      this.imageURL = base64String;
      const base64Data = base64String;
      // const base64Data = base64String.split(',')[1];



      this.selectedFileBase64 = base64Data;
      const imgElement = document.getElementById('member-img') as HTMLImageElement;
      if (imgElement) {
        imgElement.src = base64String;
      }

      this.userForm.patchValue({
        profileImageUrl: base64Data
      });
    };

    reader.readAsDataURL(file);
  }



  // File Upload Background
  bgimageURL: string | undefined;
  bgfileChange(event: any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    document.getElementById('')
    this.userForm.patchValue({
      // image_src: file.name
      image_src: 'avatar-8.jpg'
    });
    const reader = new FileReader();
    reader.onload = () => {
      this.bgimageURL = reader.result as string;
      (document.getElementById('cover-img') as HTMLImageElement).src = this.bgimageURL;
    }
    reader.readAsDataURL(file)
  }

  //////////////////////////////////////////////////////

  // View Data Get
  viewDataGet(id: any) {
    var teamData = this.Team.filter((team: any) => {
      return team.id === id;
    });
    var profile_img = teamData[0].userImage ?
      `<img src="` + teamData[0].userImage + `" alt="" class="avatar-lg img-thumbnail rounded-circle mx-auto">` :
      `<div class="avatar-lg img-thumbnail rounded-circle flex-shrink-0 mx-auto fs-20">
        <div class="avatar-title bg-danger-subtle text-danger rounded-circle">`+ teamData[0].name[0] + `</div>
      </div>`
    var img_data = (document.querySelector('.profile-offcanvas .team-cover img') as HTMLImageElement);
    img_data.src = teamData[0].backgroundImg;
    var profile = (document.querySelector('.profileImg') as HTMLImageElement);
    profile.innerHTML = profile_img;
    (document.querySelector('.profile-offcanvas .p-3 .mt-3 h5') as HTMLImageElement).innerHTML = teamData[0].name;
    (document.querySelector('.profile-offcanvas .p-3 .mt-3 p') as HTMLImageElement).innerHTML = teamData[0].jobPosition;
    (document.querySelector('.project_count') as HTMLImageElement).innerHTML = teamData[0].projectCount;
    (document.querySelector('.task_count') as HTMLImageElement).innerHTML = teamData[0].taskCount;
  }

  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  // Edit Data
  EditData(content: any, id: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Members';
    var updateBtn = document.getElementById('addNewMember') as HTMLAreaElement;
    updateBtn.innerHTML = "Update";
    let econtent = this.Team[id];
    this.userForm.controls['name'].setValue(econtent.name);
    this.userForm.controls['jobPosition'].setValue(econtent.jobPosition);
    this.userForm.controls['projectCount'].setValue(econtent.projectCount);
    this.userForm.controls['taskCount'].setValue(econtent.taskCount);
    this.userForm.controls['_id'].setValue(econtent.id);
    var coverimg: any = document.getElementById('cover-img');
    coverimg.src = econtent.backgroundImg

    var img: any = document.getElementById('member-img');
    if (econtent.userImage) {
      img.src = econtent.userImage
    } else {
      (document.getElementById("member-img") as HTMLElement).style.display = "block"
    }
  }

  usersData: User[] = [
    {
      id: 1,
      firstName: "Alice",
      lastName: "Smith",
      userName: "asmith",
      gender: "Female",
      userEmail: "alice.smith@example.com",
      phoneNumber: "+11234567890",
      profileImageUrl: "https://example.com/images/alice.jpg",
      gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      isActive: true
    },
    {
      id: 2,
      firstName: "Bob",
      lastName: "Johnson",
      userName: "bobbyj",
      gender: "Male",
      userEmail: "bob.johnson@example.com",
      phoneNumber: "+11234567891",
      profileImageUrl: "https://example.com/images/bob.jpg",
      gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      isActive: false
    },
    {
      id: 3,
      firstName: "Carol",
      lastName: "Williams",
      userName: "carolw",
      gender: "Female",
      userEmail: "carol.williams@example.com",
      phoneNumber: "+11234567892",
      profileImageUrl: "https://example.com/images/carol.jpg",
      gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
      isActive: true
    },
    {
      id: 4,
      firstName: "David",
      lastName: "Brown",
      userName: "daveb",
      gender: "Male",
      userEmail: "david.brown@example.com",
      phoneNumber: "+11234567893",
      profileImageUrl: "https://example.com/images/david.jpg",
      gradient: "linear-gradient(135deg, #fda085 0%, #f6d365 100%)",
      isActive: false
    },
    {
      id: 5,
      firstName: "Emma",
      lastName: "Jones",
      userName: "emmaj",
      gender: "Female",
      userEmail: "emma.jones@example.com",
      phoneNumber: "+11234567894",
      profileImageUrl: "https://example.com/images/emma.jpg",
      gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      isActive: true
    },
    {
      id: 6,
      firstName: "Frank",
      lastName: "Garcia",
      userName: "frankg",
      gender: "Male",
      userEmail: "frank.garcia@example.com",
      phoneNumber: "+11234567895",
      profileImageUrl: "https://example.com/images/frank.jpg",
      gradient: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
      isActive: false
    },
    {
      id: 7,
      firstName: "Grace",
      lastName: "Miller",
      userName: "gracem",
      gender: "Female",
      userEmail: "grace.miller@example.com",
      phoneNumber: "+11234567896",
      profileImageUrl: "https://example.com/images/grace.jpg",
      gradient: "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
      isActive: true
    },
    {
      id: 8,
      firstName: "Henry",
      lastName: "Davis",
      userName: "henryd",
      gender: "Male",
      userEmail: "henry.davis@example.com",
      phoneNumber: "+11234567897",
      profileImageUrl: "https://example.com/images/henry.jpg",
      gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      isActive: false
    },
    {
      id: 9,
      firstName: "Isabella",
      lastName: "Martinez",
      userName: "isabellam",
      gender: "Female",
      userEmail: "isabella.martinez@example.com",
      phoneNumber: "+11234567898",
      profileImageUrl: "https://example.com/images/isabella.jpg",
      gradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
      isActive: true
    },
    {
      id: 10,
      firstName: "Jack",
      lastName: "Rodriguez",
      userName: "jackr",
      gender: "Male",
      userEmail: "jack.rodriguez@example.com",
      phoneNumber: "+11234567899",
      profileImageUrl: "https://example.com/images/jack.jpg",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      isActive: false
    }
  ];




}
