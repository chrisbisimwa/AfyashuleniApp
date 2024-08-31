import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-schools',
  templateUrl: 'schools.page.html',
  styleUrls: ['schools.page.scss']
})
export class SchoolsPage {
  schools: any[] = [];

  constructor( private dataService: DataService,  private navController: NavController,
    private toastCtrl: ToastController,
    public plt: Platform) {
    this.fetchSchools();
  }


  //fech all schools from local storage

  async fetchSchools(refresher?: any) {
    const schools = await this.dataService.get('schools');
    this.schools = schools.data || [];

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

 async new() {
  await this.navController.navigateForward('/schools/new');
}

 async view(id:any) {
  await this.navController.navigateForward('/schools/' + id + '/view');
}
async edit(item: IonItemSliding, site: any) {
  await this.navController.navigateForward('/tabs/entities/customer/' + site.id + '/edit');
  await item.close();
}

async delete(customer:any) {
  /*  this.customerService.delete(customer.id).subscribe(
     async () => {
       const toast = await this.toastCtrl.create({ message: 'Customer deleted successfully.', duration: 3000, position: 'middle' });
       await toast.present();
       await this.loadAll();
     },
     error => console.error(error)
   ); */
 }

}
