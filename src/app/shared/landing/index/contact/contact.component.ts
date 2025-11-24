import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResponseCode } from 'src/app/core/consts/api.consts';
import { ResponseVM } from 'src/app/core/interfaces/api.interface';
import { ApiCallService } from 'src/app/core/services/api-call-service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  standalone: false
})

export class ContactComponent implements OnInit {
  // Injecting services
  private readonly _apiCallService: ApiCallService = inject(ApiCallService);
  private readonly _toasterService: ToastService = inject(ToastService);

  contactForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      requesterName: ['', [Validators.required, Validators.minLength(3)]],
      requesterEmail: ['', [Validators.required, Validators.email]],
      requesterPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      organizationName: ['', Validators.required],
      remarks: ['', [Validators.required, Validators.minLength(10)]],
      // meetingLink: ['', Validators.required],
      // requestedDate: ['', Validators.required],
      // scheduledDate: ['', Validators.required],
      // completedDate: ['', Validators.required],
      // status: ['', Validators.required],
      // assignedTo: ['', Validators.required]
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (!this.contactForm || this.contactForm.invalid) return;

    const payload = {
      ...this.contactForm.value,
    };

    this._apiCallService.PostCall(payload, 'demo')
      .subscribe((res: ResponseVM) => {
        if (res.responseCode == ResponseCode.Success) {
          this._toasterService.success(res.responseMessage);
          this.contactForm.reset();
          this.submitted = false;
        } else {
          this._toasterService.error(res.errorMessage);
        }
      });
  }

}
