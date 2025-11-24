import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ResponseCode } from 'src/app/core/consts/api.consts';
import { ResponseVM } from 'src/app/core/interfaces/api.interface';
import { ApiCallService } from 'src/app/core/services/api-call-service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
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

  loginForm!: FormGroup;
  submitted = false;
  fieldTextType = false;
  error = '';
  returnUrl = '';
  year: number = new Date().getFullYear();

  private readonly _apiCallService: ApiCallService = inject(ApiCallService);
  private readonly _toasterService: ToastService = inject(ToastService);
  private readonly _authService: AuthenticationService = inject(AuthenticationService);
  private readonly _spinnerService: NgxSpinnerService = inject(NgxSpinnerService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this._spinnerService.hide();
    this.loginForm = this.fb.group({
      mail: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    const savedLogin = localStorage.getItem('rememberedLogin');
    if (savedLogin) {
      const { mail, password } = JSON.parse(savedLogin);
      this.loginForm.patchValue({ mail, password, rememberMe: true });
    }
  }


  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    if (!this.loginForm || this.loginForm.invalid) return;

    const payload = {
      mail: this.f['mail'].value,
      password: this.f['password'].value
    };

    // if (payload.mail == 'admin@gmail.com' && payload.password == "admin@123") {
    //   if (this.f['rememberMe'].value) {
    //     localStorage.setItem('rememberedLogin', JSON.stringify({
    //       mail: payload.mail,
    //       password: payload.password,
    //       rememberMe: true
    //     }));
    //     const userDetails = {

    //     }
    //   } else {
    //     localStorage.removeItem('rememberedLogin');
    //   }
    //   this._toasterService.success("Login Success");
    //   this.router.navigate(['/dashboard']);
    // }

    this._spinnerService.show();
    this._apiCallService.PostCall(payload, 'ApplicationUser/LogInUser').subscribe((res: ResponseVM) => {
      if (res.responseCode == ResponseCode.Success) {
        this._toasterService.success(res.responseMessage);
        this._authService.saveUserDetailsOnLogin(res.data);
        if (this.f['rememberMe'].value) {
          localStorage.setItem('rememberedLogin', JSON.stringify({
            mail: payload.mail,
            password: payload.password,
            rememberMe: true
          }));
        } else {
          localStorage.removeItem('rememberedLogin');
        }

        this.router.navigate(['/dashboard']);
        this._spinnerService.hide();

      } else {
        this._toasterService.error(res.responseMessage);
        this._spinnerService.hide();
      }
    }, (error) => {
      this._spinnerService.hide();
    });

  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

}
