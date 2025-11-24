import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
 * Pass-Reset Basic Component
 */
export class BasicComponent implements OnInit {

  // Password reset Form
  passresetForm!: FormGroup;
  submitted = false;
  year: number = new Date().getFullYear();

  private readonly _apiCallService: ApiCallService = inject(ApiCallService);
  private readonly _toasterService: ToastService = inject(ToastService)

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.passresetForm = this.fb.group({
      email: ['', [Validators.required,Validators.email]]
    });
  }


  get f() { return this.passresetForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    if (!this.passresetForm || this.passresetForm.invalid) return;

    const email = this.f['email'].value;

    this._apiCallService.PostCall( null,`User/ForgetUserPassword?email=${email}`).subscribe((res: ResponseVM) => {
      if (res.responseCode == ResponseCode.Success) {
        this._toasterService.success(res.responseMessage);
      } else {
        this._toasterService.error(res.errorMessage);
      }
    })
  }

}
