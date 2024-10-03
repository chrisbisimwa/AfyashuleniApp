import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-schools',
  templateUrl: 'schools.page.html',
  styleUrls: ['schools.page.scss']
})
export class SchoolsPage {
  schools: any[] = [];

  myKey:any = 'schools';
  myValue: any;

  constructor( private dataService: DataService,  private navController: NavController,
    private toastCtrl: ToastController,
    public plt: Platform,
    private appStorage: Storage
  ) {
    this.fetchSchools();

   

  }

  async deleteSchool(sch: any) {
    const result = await this.appStorage.get('schools');
            
    let school = result.find((sch: any) => sch.id == sch.id);
    if(school){
      result.splice(result.indexOf(school), 1);

      school.status="deleted"

      result.push(school);

      this.appStorage.set('schools', result);

      this.fetchSchools();
    }

    
  }

  



  //fech all schools from local storage

  async fetchSchools(refresher?: any) {
    const result = await this.appStorage.get(this.myKey);
    if (result) {
      
      this.schools = result.filter((item:any) => item.status !== 'deleted');
    }

    if (refresher) {
      refresher.target.complete();
    }
  }

  search(query:any, refresher?:any) {
    if (!query) {
      this.fetchSchools(refresher);

   } else {
      
      let result = this.schools.filter(item => 
        Object.keys(item).some(k => item[k] != null && 
        item[k].toString().toLowerCase()
        .includes(query.toLowerCase()))
        );
        
      this.schools=result ;
     
   } 
 }

 segmentChanged(event:any) {
  this.fetchSchools(event);
}

 async new() {
  await this.navController.navigateForward('/tabs/schools/new');
}

 async view(school:any) {
    await this.navController.navigateForward('/tabs/schools/' + school.id + '/view');
 

}
async edit(item: IonItemSliding, school: any) {
  await this.navController.navigateForward('/tabs/schools/' + school.id + '/edit');
  await item.close();
}



}
