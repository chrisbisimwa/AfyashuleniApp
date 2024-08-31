import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  username:string="";
  email:string="";
  photo: string="";

  constructor(public authService: AuthService,private router: Router,private sanitizer:DomSanitizer) { }

  ngOnInit() {
  }


  goToEditProfile(){
    this.router.navigate(['tabs/account/edit-profile']);
  }

  goToChangePassword() {
    this.router.navigate(['tabs/account/change-password']);
  }

  goToManageUsers(){
    this.router.navigate(['tabs/account/manage-users']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

}
