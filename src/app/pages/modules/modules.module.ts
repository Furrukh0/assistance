import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { OrganizationComponent } from "./organization/organization.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// Load Icons
import { defineElement } from "@lordicon/element";
import lottie from 'lottie-web';
import { DemoRequestComponent } from "./demo-request/demo-request.component";
import { UserComponent } from "./user/user.component";
import { SharedModule } from "src/app/shared/shared.module";
import { FlatpickrModule } from "angularx-flatpickr";
import { DROPZONE_CONFIG, DropzoneConfigInterface, DropzoneModule } from "ngx-dropzone-wrapper";
import { CallAnalysisComponent } from "./call-analysis/call-analysis.component";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
    url: 'https://httpbin.org/post',
    maxFilesize: 50,
    acceptedFiles: 'image/*'
};


@NgModule({
    declarations: [
        OrganizationComponent,
        DemoRequestComponent,
        UserComponent,
        CallAnalysisComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        FlatpickrModule,
        DropzoneModule,
        NgbDropdownModule
    ],

    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModulesModule {
    constructor() {
        defineElement(lottie.loadAnimation);
    }
}