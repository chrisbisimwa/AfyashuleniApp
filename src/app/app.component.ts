import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SyncService } from './services/sync.service';
import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform, private syncService: SyncService, private dataService: DataService, private authService: AuthService, private router: Router) {
    this.initializeApp();
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
}
