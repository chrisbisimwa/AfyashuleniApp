import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { initZone } from 'zone.js/lib/zone-impl';
import { SplashScreen } from '@capacitor/splash-screen';

import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Network, ConnectionStatus } from '@capacitor/network';
import { lastValueFrom } from 'rxjs';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  networkStatus: ConnectionStatus;
  constructor(
    private platform: Platform,
    private router: Router,
    private apiService: ApiService,
    private appStorage: Storage,
    private loadingCtrl: LoadingController,) {

    this.init();

  }

  async init() {
    await this.appStorage.defineDriver(CordovaSQLiteDriver);
    await this.appStorage.create();

    this.checkLogin();
    this.checkNetwork();

    
  }

  checkLogin() {
    this.appStorage.get('authToken').then(token => {
      if (token) {
        this.router.navigate(['/tabs/home']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  checkNetwork() {
    if (Network) {
      Network.getStatus().then(status => {
        this.networkStatus = status;
        if (this.networkStatus.connected) {
          this.checkDataToSync().then(() => {
            this.loadAllData();
          });
        }


      });

      Network.addListener('networkStatusChange', (status) => {
        this.networkStatus = status;

        if (this.networkStatus.connected) {
          this.checkDataToSync().then(() => {
            this.loadAllData();
          });
        }

      });


    }
  }

  async checkDataToSync() {
    //verifie s'il y a des années scolaires à synchroniser
    let schoolYears = await this.appStorage.get('schoolYears');
    if (schoolYears) {
      for (let sy of schoolYears) {
        if (!sy.created_at && !sy.updated_at) {
          //synchroniser l'année scolaire
          console.log('synchroniser l\'année scolaire');
        }
      }

    }

    //verifie s'il y a des écoles à synchroniser
    let schools = await this.appStorage.get('schools');
    if (schools) {
      for (let sc of schools) {
        if (!sc.created_at && !sc.updated_at) {
          const schoolPromise = this.apiService.postSchool(sc); // Stockez la Promise
          const schoolObservable = await schoolPromise; // Récupérez l'Observable
          const school = await lastValueFrom(schoolObservable);

        }else if(sc.status=="deleted"){
          const schoolPromise = this.apiService.deleteSchool(sc.id);
          const schoolObservable = await schoolPromise;
          const school =await lastValueFrom(schoolObservable).then((data:any)=>{
            console.log(data);
          });
        }
      }

    }

    //verifie s'il y a des classes à synchroniser
    let classes = await this.appStorage.get('classes');
    if (classes) {
      for (let cl of classes) {
        if (!cl.created_at && !cl.updated_at) {
          const classPromise = this.apiService.postClass(cl.school_id, cl); // Stockez la Promise
          const classObservable = await classPromise; // Récupérez l'Observable
          const cls = await lastValueFrom(classObservable);

        }
      }
    }

    //verifie s'il y a des élèves à synchroniser
    let students = await this.appStorage.get('students');
    if (students) {
      for (let st of students) {
        if (!st.created_at && !st.updated_at) {
          const studentPromise = this.apiService.postStudent(st); // Stockez la Promise
          const studentObservable = await studentPromise; // Récupérez l'Observable
          const std = await lastValueFrom(studentObservable);

        }
      }
    }

    //verifie s'il y a des historiques des élèves à synchroniser
    let studentHistory = await this.appStorage.get('student-history');
    if (studentHistory) {
      for (let sth of studentHistory) {
        if (!sth.created_at && !sth.updated_at) {
          const studentHistoryPromise = this.apiService.postStudentHistory(sth); // Stockez la Promise
          const studentHistoryObservable = await studentHistoryPromise; // Récupérez l'Observable
          const stdHistory = await lastValueFrom(studentHistoryObservable);

        }
      }
    }



  }







  async loadAllData() {
    const studentsPromise = this.apiService.getStudents(); // Stockez la Promise
    const studentsObservable = await studentsPromise; // Récupérez l'Observable
    const students: any = await lastValueFrom(studentsObservable).then((data: any) => {
      if (data.data) {
        this.appStorage.set('students', data.data);
      }
    });

    const studentHistoryPromise = this.apiService.getStudentHistory(1); // Stockez la Promise
    const studentHistoryObservable = await studentHistoryPromise; // Récupérez l'Observable
    const studentHistory: any = await lastValueFrom(studentHistoryObservable).then((data: any) => {
      if (data.data) {
        this.appStorage.set('student-history', data.data);
      }
    });




    const problemsPromise = this.apiService.getProblems(); // Stockez la Promise
    const problemsObservable = await problemsPromise; // Récupérez l'Observable
    const problems: any = await lastValueFrom(problemsObservable).then((data: any) => {
      if (data.data) {
        console.log(data.data);
        this.appStorage.set('problems', data.data);
      }
    });


    const schoolYearsPromise = this.apiService.getSchoolYears(); // Stockez la Promise
    const schoolYearsObservable = await schoolYearsPromise; // Récupérez l'Observable
    const schoolYears: any = await lastValueFrom(schoolYearsObservable).then((data: any) => {
      if (data.data) {
        this.appStorage.set('schoolYears', data.data);
      }
    });



    const schoolsPromise = this.apiService.getSchools(); // Stockez la Promise
    const schoolsObservable = await schoolsPromise; // Récupérez l'Observable
    const schools: any = await lastValueFrom(schoolsObservable).then((data: any) => {

      if (data.data) {
        this.appStorage.set('schools', data.data);
      }
    });



    //load all classes by schools
    const schls = await this.appStorage.get('schools');
    if (schls) {
      let cls: any[] = [];
      for (let school of schls) {
        const classesPromise = this.apiService.getClasses(school.id); // Stockez la Promise
        const classesObservable = await classesPromise; // Récupérez l'Observable
        const classes: any = await lastValueFrom(classesObservable).then((dt: any) => {
          if (dt && dt.data && dt.data.length > 0) {
            for (let cl of dt.data) {
              cls.push(cl);
            }

            this.appStorage.set('classes', cls);

          }
        });


      }

    }






  }



}
