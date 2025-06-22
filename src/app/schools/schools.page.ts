import { Component } from '@angular/core';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-schools',
  templateUrl: 'schools.page.html',
  styleUrls: ['schools.page.scss']
})
export class SchoolsPage {
  schools: any[] = [];
  user: any;
  roles: any[] = [];

  myKey:any = 'schools';
  myValue: any;
  isLoading: HTMLIonLoadingElement | null = null;

  constructor(  private navController: NavController,
    private toastCtrl: ToastController,
    public plt: Platform,
    private appStorage: Storage) {

    this.fetUser().then(() => {
      this.fetchSchools();
      this.fetchRoles();
    });

   

  }

  ionViewDidEnter() {
    this.fetUser().then(() => {
      this.fetchSchools();
      this.fetchRoles();
    });
    
  }

  async fetUser(){
    this.appStorage.get('user').then((val) => {
      this.user=val;
    });
  }

  async fetchRoles(){
    this.appStorage.get('roles').then((val) => {
      this.roles=val;
    });
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
    
    if (result && this.user) {
      this.schools = result.filter((item:any) => item.status !== 'deleted' && item.group_id == this.user.group_id);
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
