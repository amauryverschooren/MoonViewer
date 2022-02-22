import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMaterialModule } from 'src/material.module';
import { LoginComponent } from './pages/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { DashboardViewComponent } from './pages/dashboard-view/dashboard-view.component';
import { SplashScreenComponent } from './pages/splash-screen/splash-screen.component';
import { NgChartsModule } from 'ng2-charts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ToastrModule } from 'ngx-toastr';
import { DialogComponent } from './pages/dashboard-view/Dialog/dialog/dialog.component';
import {NgxFilesizeModule} from 'ngx-filesize';
import { IonicModule } from '@ionic/angular';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardViewComponent,
    SplashScreenComponent,
    DialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatMaterialModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    LayoutModule,
    NgChartsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    ToastrModule.forRoot(),
    AngularSvgIconModule.forRoot(),
    NgxFilesizeModule,
    IonicModule.forRoot()
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
