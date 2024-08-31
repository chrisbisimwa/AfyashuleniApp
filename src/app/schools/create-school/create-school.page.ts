import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-create-school',
  templateUrl: './create-school.page.html',
  styleUrls: ['./create-school.page.scss'],
})
export class CreateSchoolPage implements OnInit {

  isReadyToSave: boolean=false;
  name:string='';
  address: string='';
  longitude: number=0.0;
  latitude: number=0.0;
  createdBy: string='';
  form = this.formBuilder.group({
    name: ["", []],
    address: ['', []],
    latitude: [0.0, []],
    longitude: [0.0, []],
});

  constructor(
    public platform: Platform,
    protected formBuilder: FormBuilder,
    private dataService: DataService,
  ) { 
    this.form.valueChanges.subscribe(v => {
      this.isReadyToSave = this.form.valid;
    });
  }

  ngOnInit() {
  }

  save(){
    // save the form data to local storage

    this.dataService.get('schools').then((data)=>{
      let schools = data.data;
   
      schools.push(this.form.value);

      data.data=schools;

      this.dataService.set('schools', data);
    })


  }

  updateForm() {
    this.form.patchValue({
     name: this.name,
     latitude: this.latitude,
     longitude: this.longitude,
     address: this.address,
   });
}


  previousState() {
    window.history.back();
  }

}
