import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
 * Basic Component
 */
export class BasicComponent implements OnInit {

  // Pass-Reset Form
  passresetForm!: FormGroup;
  submitted = false;
  fieldTextType = false;
  confirmFieldTextType: boolean = false;
  year: number = new Date().getFullYear();
  passwordRequirements = '';
  resetToken: string = '';

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
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.resetToken = params['resetToken'] || '';
    });
    /**
     * Form Validatyion
     */
    this.passresetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.passresetForm.get('password')?.valueChanges.subscribe(value => {
      this.checkPasswordStrength();
    });

  }

  get f() { return this.passresetForm.controls; }

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

    if (this.passresetForm.invalid || this.passwordRequirements) {
      return;
    }

       const password = this.f['password'].value;
    
        this._apiCallService.PostCall(null, `User/ResetUserPassword?resetToken=${encodeURIComponent(this.resetToken)}&password=${encodeURIComponent(password)}`).subscribe((res: ResponseVM) => {
          if (res.responseCode == ResponseCode.Success) {
           this._toasterService.success(res.responseMessage);
            this.passresetForm.reset();
            this.submitted = false;
            this.router.navigate(['/']);
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
