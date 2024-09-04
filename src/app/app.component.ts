import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SyncService } from './services/sync.service';
import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { initZone } from 'zone.js/lib/zone-impl';
import { SplashScreen } from '@capacitor/splash-screen';

import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
     private syncService: SyncService, 
     private dataService: DataService, 
     private authService: AuthService, 
     private router: Router,
    
     private appStorage: Storage,
     private loadingCtrl: LoadingController,) {
      this.init();
    //this.initializeApp();
  }

  async init(){
    await this.appStorage.defineDriver(CordovaSQLiteDriver);
    await this.appStorage.create();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Check if the user is already authenticated
  
     
      const isLoggedIn = this.authService.isLoggedIn();
      console.log('User is logged in:', isLoggedIn);
      if (isLoggedIn) {
        // User is authenticated, synchronize data
        this.syncService.syncData();
      } else {
        // User is not authenticated, handle accordingly
        this.router.navigate(['/login']);
      }
        
      });
    
  }

  



      /* async initializeApp() {
        this.platform.ready().then(async () => {
          const loading = await this.loadingCtrl.create();
          await loading.present();
          this.databaseService.init();
          this.databaseService.dbReady.subscribe(isReady => {
            if (isReady) {
              loading.dismiss();
            }
          });
        });
      } */
}
