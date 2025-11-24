import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DemoRequestComponent } from "./demo-request/demo-request.component";
import { UserComponent } from "./user/user.component";
import { OrganizationComponent } from "./organization/organization.component";
import { CallAnalysisComponent } from "./call-analysis/call-analysis.component";

const routes: Routes = [
    {
        path: "demo-request",
        component: DemoRequestComponent
    },
    {
        path: 'organization',
        component: OrganizationComponent
    },
    {
        path: 'user',
        component: UserComponent
    },
    {
        path: 'call-analysis',
        component: CallAnalysisComponent
    }


]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ModuleRoutingModule { };