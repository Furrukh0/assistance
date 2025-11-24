import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ResponseCode } from 'src/app/core/consts/api.consts';
import { ResponseVM } from 'src/app/core/interfaces/api.interface';
import { ApiCallService } from 'src/app/core/services/api-call-service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
  standalone: false
})

/**
 * Signup Basic Component
 */
export class BasicComponent implements OnInit {

  // SignUp Form
  SignupForm!: FormGroup;
  submitted = false;
  fieldTextType = false;
  confirmFieldTextType: boolean = false;
  year: number = new Date().getFullYear();
  passwordRequirements = '';

  // Password strength indicators
  passLengthValid = false;
  passLowerValid = false;
  passUpperValid = false;
  passNumberValid = false;
  passSpecialValid = false;

  //Services
  private readonly _apiCallService: ApiCallService = inject(ApiCallService);
  private readonly _toasterService: ToastService = inject(ToastService)

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.SignupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.SignupForm.get('password')?.valueChanges.subscribe(value => {
      this.checkPasswordStrength();
    });
  }


  get f() { return this.SignupForm.controls; }

  checkPasswordStrength() {
    const password = this.f['password'].value || '';

    this.passLengthValid = password.length >= 8;
    this.passLowerValid = /[a-z]/.test(password);
    this.passUpperValid = /[A-Z]/.test(password);
    this.passNumberValid = /[0-9]/.test(password);
    this.passSpecialValid = /[!@#$%^&*]/.test(password);
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    this.checkPasswordStrength();

    if (this.SignupForm.invalid || this.passwordRequirements) {
      return;
    }

    const payload = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      userName: this.f['userName'].value,
      email: this.f['email'].value,
      password: this.f['password'].value
    };

    this._apiCallService.PostCall(payload, 'User/CreateUser').subscribe((res: ResponseVM) => {
      if (res.responseCode == ResponseCode.Success) {
        this._toasterService.success(res.responseMessage);
        this.SignupForm.reset();
        this.submitted = false;
        this.router.navigate(['auth/signin']);

      } else {
       this._toasterService.error(res.errorMessage);
      }
    })
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleConfirmFieldTextType() {
    this.confirmFieldTextType = !this.confirmFieldTextType;
  }
}
