import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';

// Auth
import { AuthGuard } from './core/guards/auth.guard';
import { IndexComponent } from './landing/index/index.component';
import { BasicComponent } from './account/auth/signin/basic/basic.component';
import { DetailsComponent } from './pages/tickets/details/details.component';

const routes: Routes = [
  {
    path: '',
    component: BasicComponent,
    loadChildren: () => import('./account/auth/signin/signin-routing.module').then(m => m.SigninRoutingModule)
  },
  {
    path: '',
    component: IndexComponent,
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule)
  },
  {
    path: 'pages',
    loadChildren: () => import('./extraspages/extraspages.module').then(m => m.ExtraspagesModule), canActivate: [AuthGuard]
  },
  {
    // canActivate: [AuthGuard],
    path: 'dashboard',
    component: LayoutComponent,
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
  },
  { path: 'tickets/details/:id', component: DetailsComponent},
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
