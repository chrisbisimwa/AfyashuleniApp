import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-exams',
  templateUrl: 'exams.page.html',
  styleUrls: ['exams.page.scss']
})
export class ExamsPage {
  exams: any[] = [];
  segment = "Unresolved"

  constructor(private dataService: DataService, private navController: NavController,
    private toastCtrl: ToastController,
    public plt: Platform) { }


  async fetchExams(refresher?: any) {
    //fetch exams from local storage
    const exams = await this.dataService.get('exams');
    this.exams = exams.data || [];

  }

  segmentChanged(event:any) {
    this.fetchExams(null);
  }

  search(query:any, refresher?:any) {
    if (!query) {
      this.fetchExams(refresher);

   } else {
      
      let result = this.exams.filter(item => 
        Object.keys(item).some(k => item[k] != null && 
        item[k].toString().toLowerCase()
        .includes(query.toLowerCase()))
        );
        
      this.exams=result ;
     
   } 
 }

 async resolve(item: IonItemSliding, exam: any) {
  await this.navController.navigateForward('/tabs/entities/customer/' + exam.id + '/edit');
  await item.close();
}

 async new() {
  await this.navController.navigateForward('/exams/new');
}

 async view(id:any) {
  await this.navController.navigateForward('/tabs/site/' + id + '/view');
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
