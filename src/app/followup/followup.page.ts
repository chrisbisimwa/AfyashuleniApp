import { Component, OnInit } from '@angular/core';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-followup',
  templateUrl: './followup.page.html',
  styleUrls: ['./followup.page.scss'],
})
export class FollowupPage implements OnInit {
  followups: any[] = [];

  constructor(
    private navController: NavController,
    public plt: Platform,
  ) { }

  ngOnInit() {
  }

  fetchFollowups(refresher?: any, user?: any){

  }

  search(query: any, refresher?: any) {

  }

  async view(followupId: any) {
    //console.log('examId', examId);
    await this.navController.navigateForward('/tabs/followup/' + followupId + '/view');

  }

  async new(){
    await this.navController.navigateForward('/tabs/followup/new');
  }

  edit(item: IonItemSliding, site: any){

  }

  delete( customer: any){

  }

}
