import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-edit-profil',
  templateUrl: './edit-profil.page.html',
  styleUrls: ['./edit-profil.page.scss'],
})
export class EditProfilPage implements OnInit {


  name = "";
  email = '';
  phone = "";
  photo ="";
  constructor(
    private navController: NavController,
    private appStorage: Storage
  ) { }

  ngOnInit() {
    this.fetchUser();
  }

  fetchUser(){
    //fetch user from local storage
    this.appStorage.get('user').then((data) => {
      this.name = data.name;
      this.email = data.email;
      this.phone = data.phone;
      this.photo = data.photo;
    });
  }

  save(){
    //save user to local storage
    this.appStorage.get('user').then((data) => {
      data.name = this.name;
      data.email = this.email;
      data.phone = this.phone;
      data.photo = this.photo;
      data.status = 'updated';
      this.appStorage.set('user', data);
    });

    this.goBack();

  }

  goToImageUpload(){
    this.navController.navigateBack('/tabs/account/edit-profile/upload-image');
  }

  goBack() {
    this.navController.back();
  }


}
