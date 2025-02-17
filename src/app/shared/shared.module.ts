import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environments';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  imports: [
    CommonModule,
    ToastComponent,
    SpinnerComponent,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    SidebarComponent
  ],
  exports: [
    ToastComponent,
    SpinnerComponent,
    SidebarComponent
  ]
})
export class SharedModule { }
