import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginFlag = false;
  public loginValid = true;
  public username = '';
  public password = '';

  public onSubmit(): void {
    this.loginValid = true;
    this.api.login(this.username, this.password).subscribe(result => {
        this.loginValid = true;
        this.api.loggedInUser = result;
        if (this.api.loggedInUser.result.action == "user_logged_in") {
          localStorage.setItem('username', this.api.loggedInUser.result.username);
          localStorage.setItem('token', this.api.loggedInUser.result.token);
          localStorage.setItem('refresh_token', this.api.loggedInUser.result.refresh_token);
          localStorage.setItem('action', this.api.loggedInUser.result.action);
          this.router.navigateByUrl('/dashboardview');
        }
        console.log(this.api.loggedInUser.result)
        
    });
  }
  constructor(private api: ApiService, private router: Router) { 
    this.api.checkUserStatus().subscribe(result => {
      console.log("result", result);
      localStorage.removeItem('token');
      localStorage.setItem('token', result.result.token)
      
      this.router.navigateByUrl('/dashboardview');
    },
    (error: HttpErrorResponse)=> {
      this.loginFlag = true;
      console.log("errxdfgbor", error.error.code);
    })
  }

  ngOnInit(): void {

  }

}
