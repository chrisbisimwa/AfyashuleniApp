import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DataService } from './data.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(
    private apiService: ApiService,
    private dataService: DataService
  ) { }

  async syncData() {
    const isConnected = navigator.onLine;

    if (isConnected) {
      const schoolYearsPromise = this.apiService.getSchoolYears(); // Stockez la Promise
      const schoolYearsObservable = await schoolYearsPromise; // Récupérez l'Observable
      const schoolYears = await lastValueFrom(schoolYearsObservable);

      this.dataService.set('schoolYears', schoolYears);

      const schoolsPromise= this.apiService.getSchools(); // Stockez la Promise
      const schoolsObservable = await schoolsPromise; // Récupérez l'Observable
      const schools = await lastValueFrom(schoolsObservable);
      this.dataService.set('schools', schools);


      // Synchronisation des autres ressources...
    }
  }
}
