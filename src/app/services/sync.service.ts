import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DataService } from './data.service';
import { lastValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private authService: AuthService

  ) { }

  async syncData() {
    const isConnected = navigator.onLine;

    if (isConnected) {

      //verifie if there is schools to save to remote database (schools that do not have id and createdDate)
      this.dataService.get('schools').then(async (data) => {
        if (data && data.data) {
          for (let ds of data.data) {
            if (!ds.id && !ds.created_at) {
              const schoolPromise = this.apiService.postSchool(ds); // Stockez la Promise
              const schoolObservable = await schoolPromise; // Récupérez l'Observable
              const school = await lastValueFrom(schoolObservable);
              console.log(school);
              
            }
          }
        }
      })



      const schoolYearsPromise = this.apiService.getSchoolYears(); // Stockez la Promise
      const schoolYearsObservable = await schoolYearsPromise; // Récupérez l'Observable
      const schoolYears = await lastValueFrom(schoolYearsObservable);

      this.dataService.set('schoolYears', schoolYears);

      const schoolsPromise= this.apiService.getSchools(); // Stockez la Promise
      const schoolsObservable = await schoolsPromise; // Récupérez l'Observable
      const schools = await lastValueFrom(schoolsObservable);
      this.dataService.set('schools', schools);

      const problemsPromise = this.apiService.getProblems(); // Stockez la Promise
      const problemsObservable = await problemsPromise; // Récupérez l'Observable
      const problems = await lastValueFrom(problemsObservable);
      this.dataService.set('problems', problems);



      const schs = await this.dataService.get('schools');

      if (schs.data.length > 0) {
        let clas = [];
        for (const school of schs.data) {
          if (school.id && school.created_at) {
            const classesPromise = this.apiService.getClasses(school.id); // Stockez la Promise
            const classesObservable = await classesPromise; // Récupérez l'Observable
            const classes: any = await lastValueFrom(classesObservable);
            for (const c of classes.data) {
              clas.push(c);
            }
          }


        }

        this.dataService.set(`classes`, clas);
      }

      const schYr = await this.dataService.get('schoolYears');
      if (schYr.data.length > 0) {
        let ht = [];
        for (const schoolYear of schYr.data) {
          const studentHistoryPromise = this.apiService.getStudentHistory(schoolYear.id); // Stockez la Promise
          const studentHistoryObservable = await studentHistoryPromise; // Récupérez l'Observable
          const studentHistory: any = await lastValueFrom(studentHistoryObservable);
          for (const h of studentHistory.data) {
            ht.push(h);
          }

        }

        this.dataService.set(`student-history`, ht);
      }

      const studentsPromise = this.apiService.getStudents(); // Stockez la Promise
      const studentsObservable = await studentsPromise; // Récupérez l'Observable
      const students = await lastValueFrom(studentsObservable);
      this.dataService.set('students', students);

      const userPromise = this.authService.getUser(); // Stockez la Promise
      const userObservable = await userPromise; // Récupérez l'Observable
      const user = await lastValueFrom(userObservable);
      this.dataService.set('user', user);


      // Synchronisation des autres ressources...
    }
  }
}
