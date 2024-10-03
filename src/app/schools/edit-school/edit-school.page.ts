import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-edit-school',
  templateUrl: './edit-school.page.html',
  styleUrls: ['./edit-school.page.scss'],
})
export class EditSchoolPage implements OnInit {

  isReadyToSave: boolean = false;
  name: string = '';
  address: string = '';
  longitude: number = 0.0;
  latitude: number = 0.0;
  createdBy: string = '';
  created_at: string = '';
  updated_at: string = '';
  schoolId: number = 0;
  quartier: string = "";
  commune: string = "";
  ville: string = '';
  school: any = null;
  form = this.formBuilder.group({
    name: ["", []],
    address: ['', []],
    createdBy: [0, []],
    quartier: ['', []],
    commune: ['', []],
    ville: ['', []],
    id: [0, []]
  });
  constructor(
    public platform: Platform,
    protected formBuilder: FormBuilder,
    private alertControler: AlertController,
    private appStorage: Storage,
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController
  ) { }

  ngOnInit() {
    //load school
    this.fetchSchool();
  }

  async fetchSchool() {
    const result = await this.appStorage.get('schools');
    if (result) {
      this.school = result.find((sch: any) => sch.id == this.route.snapshot.params['id']);

      if (this.school) {
        this.schoolId = this.school.id;
        this.name = this.school.name;
        this.address = this.school.address;
        this.createdBy = this.school.createdBy;
        this.quartier = this.school.quartier;
        this.commune = this.school.commune;
        this.ville = this.school.ville;
        this.created_at = this.school.created_at;
        this.updated_at = this.school.updated_at;

      }


    }
  }

  async save() {

    const schools = await this.appStorage.get('schools');
    const school = schools.find((item: { id: any; }) => item.id == this.route.snapshot.params['id']);
    if (school) {
      schools.splice(schools.indexOf(school), 1);

      let sch: any = {};
      sch.status = 'updated';
      sch.id=this.schoolId
      sch.name = this.name ?? "";
      sch.address = this.address ?? "";
      sch.quartier = this.quartier ?? "";
      sch.commune = this.commune ?? "";
      sch.ville = this.ville ?? "";
      sch.created_at = this.created_at;
      sch.updated_at = this.updated_at;

      

      schools.push(sch);
      this.appStorage.set('schools', schools);
      this.navController.navigateBack('/tabs/schools/' + this.route.snapshot.params['id'] + '/view');
    }


    


  }


 

  goToSchools(id: number) {
    this.router.navigate(['/tabs/schools/' + id + '/view']);
  }


  previousState() {
    window.history.back();
  }

}
