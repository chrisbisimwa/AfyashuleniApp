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
          this.checkDataToSync();
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
          const school = await lastValueFrom(schoolObservable).then((sch: any) => {
            if (sch.data) {
              this.updateClasses(sc.id, sch.data);


            }
          });




        }
      }

    }

  }

  async updateClasses(schoolId: number, school: any) {
    let classes: any = await this.appStorage.get('classes');
    if (classes) {
      let cls: any[] = [];

      for (let cl of classes) {
        if (!cl.created_at && !cl.updated_at) {

          if (cl.school_id == schoolId) {

            cl.school_id = school.id;

            const classPromise = this.apiService.postClass(school.id, cl); // Stockez la Promise
            const classObservable = await classPromise; // Récupérez l'Observable
            const cls: any = await lastValueFrom(classObservable).then((cla: any) => {
              if (cla.data) {
                this.updateStudents(cl.id, cla.data);

                //cls.push(cl);
              }

            });

          }
        }
      }

      await this.appStorage.set('classes', cls);
    }
  }

  async updateStudents(classId: number, cl: any) {
    let students: any = await this.appStorage.get('students');
    if (students) {
      let stds: any[] = [];

      for (let st of students) {
        if (!st.created_at && !st.updated_at) {
          if (st.class_id == classId) {
            st.class_id = cl.id;

            const studentPromise = this.apiService.postStudent(st); // Stockez la Promise
            const studentObservable = await studentPromise; // Récupérez l'Observable
            const std: any = await lastValueFrom(studentObservable).then((st: any) => {
              if (st.data) {
                this.updateStudentHistory(st.id, st.data, classId, cl);
              }

            });
            //stds.push(st);
          }
        }
      }

    }
  }

  async updateStudentHistory(studentId: number, student: any, classeId: number, classe: any) {
    let studentHistory: any = await this.appStorage.get('studentHistory');
    if (studentHistory) {
      let stdH: any[] = [];

      for (let sh of studentHistory) {
        if (sh.student_id == studentId && sh.class_id == classeId) {
          sh.student_id = student.id;
          sh.class_id = classe.id;

          const studentHistoryPromise = this.apiService.postStudentHistory(sh); // Stockez la Promise
          const studentHistoryObservable = await studentHistoryPromise; // Récupérez l'Observable
          const stdH: any = await lastValueFrom(studentHistoryObservable).then((sh: any) => {
            if (sh.data) {

            }

          });
        }
      }

    }

  }

  async loadAllData() {
    const schoolYearsPromise = this.apiService.getSchoolYears(); // Stockez la Promise
    const schoolYearsObservable = await schoolYearsPromise; // Récupérez l'Observable
    const schoolYears: any = await lastValueFrom(schoolYearsObservable).then((data: any) => {
      if (data.data) {
        this.appStorage.set('schoolYears', data.data);
      }
    });



    const schoolsPromise = this.apiService.getSchools(); // Stockez la Promise
    const schoolsObservable = await schoolsPromise; // Récupérez l'Observable
    const schools: any = await lastValueFrom(schoolsObservable).then(async (data: any) => {
      if (data.data) {

        this.appStorage.set('schools', data.data).then(async () => {
          let clses: any = [];
          for (let sc of data.data) {
            const classesPromise = this.apiService.getClasses(sc.id); // Stockez la Promise
            const classesObservable = await classesPromise; // Récupérez l'Observable
            const classes: any = await lastValueFrom(classesObservable).then(async (dt: any) => {

              if (dt.data && dt.data.length > 0) {
                for (let cl of dt.data) {
                  clses.push(cl);

                }
              }
            });
          }




          this.appStorage.set('classes', clses);
        });

      }

    });


    const studentsPromise = this.apiService.getStudents(); // Stockez la Promise
    const studentsObservable = await studentsPromise; // Récupérez l'Observable
    const students: any = await lastValueFrom(studentsObservable).then((data: any) => {
      if (data.data) {
        this.appStorage.set('students', data.data);
      }
    });



    const problemsPromise = this.apiService.getProblems(); // Stockez la Promise
    const problemsObservable = await problemsPromise; // Récupérez l'Observable
    const problems: any = await lastValueFrom(problemsObservable).then((data: any) => {
      if (data.data) {
        this.appStorage.set('problems', data.data);
      }
    });





    const studentHistoryPromise = this.apiService.getStudentHistory(1); // Stockez la Promise
    const studentHistoryObservable = await studentHistoryPromise; // Récupérez l'Observable
    const studentHistory: any = await lastValueFrom(studentHistoryObservable).then((data: any) => {
      if (data.data) {
        this.appStorage.set('student-history', data.data);
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
