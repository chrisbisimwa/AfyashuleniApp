import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertController, Platform } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-create-school',
  templateUrl: './create-school.page.html',
  styleUrls: ['./create-school.page.scss'],
})
export class CreateSchoolPage implements OnInit {

  isReadyToSave: boolean = false;
  name: string = '';
  address: string = '';
  longitude: number = 0.0;
  latitude: number = 0.0;
  createdBy: string = '';
  schoolId: number=0;
  form = this.formBuilder.group({
    name: ["", []],
    address: ['', []],
    latitude: [0.0, []],
    longitude: [0.0, []],
    createdBy: [0, []],
    id: [0, []]
  });

  constructor(
    public platform: Platform,
    protected formBuilder: FormBuilder,
    private dataService: DataService,
    private alertControler: AlertController,
    private appStorage: Storage,
    private router: Router
  ) {
    this.form.valueChanges.subscribe(v => {
      this.isReadyToSave = this.form.valid;

    });
  }

  ngOnInit() {
    this.printCurrentPosition();
  }


  printCurrentPosition = async () => {
    const coordinates = await Geolocation.getCurrentPosition();
    this.latitude = coordinates.coords.latitude;
    this.longitude = coordinates.coords.longitude;
  };




  save() {
    this.updateForm();
    let schools = [];

    this.appStorage.get('schools').then((data) => {
      if (data) {
        schools = data;
      } else {
        schools = [];
      }
      schools.push(this.form.value);
      this.appStorage.set('schools', schools);

      this.goToSchools(this.schoolId);



    }, (error) => {
      this.alertControler.create({
        header: 'Error',
        message: 'An error occured while saving the data',
        buttons: ['OK']
      }).then(alert => alert.present());
    });


  }

  updateForm() {
    this.form.patchValue({
      name: this.name,
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address,
      createdBy: null,
      id: this.generateId()
    });
  }



  generateId() {
    //returner un très très grand nombre 
    this.schoolId = Math.floor(Math.random() * 1000000000000000000);
    this.appStorage.get('schools').then((data) => {
      if (data) {
        data.forEach((element: any) => {
          if (element.id == this.schoolId) {
            this.generateId();
          }
        });
      }
    });


    return this.schoolId;
  }

  goToSchools(id: number) {
    this.router.navigate(['/tabs/schools/' + id + '/view']);
  }


  previousState() {
    window.history.back();
  }

}
