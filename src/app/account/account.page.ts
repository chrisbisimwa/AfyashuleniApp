import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from '../services/api.service';
import { Network, ConnectionStatus } from '@capacitor/network';
import { lastValueFrom } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  networkStatus: ConnectionStatus;
  username: string = "";
  email: string = "";
  photo: string = "";

  loading: HTMLIonLoadingElement | null = null;
  constructor(
    public authService: AuthService, 
    private router: Router, 
    private sanitizer: DomSanitizer, 
    private appStorage: Storage,
    private apiService: ApiService,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    await this.loadUser();
  }

  async loadUser (){
    try {
     
      const user = await this.appStorage.get('user');
      if (user) {
        this.username = user.name;
        this.email = user.email;
        this.photo = user.photo;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    } finally {
      this.loading = null;
    }
  }

  syncData() {
    this.showLoading();
    this.checkLogin().then(() => {
      this.checkNetwork().then(()=>{

      });
    });
    
  }

  async showLoading() {
   this.loading = await this.loadingCtrl.create({
      message: 'Chargement...',
      duration: 5000,
    });

    this.loading.present();
  }

  async checkLogin() {
    this.appStorage.get('authToken').then(async token => {
      if (token) {
        //check if the token is still valid
        let tokenData = await this.apiService.checkTokenValidity();
        if (tokenData) {
          
        }else{
          this.router.navigate(['/login']);
        }
        
      } else {
        this.router.navigate(['/login']);
      }
    });
  }


  async checkNetwork() {
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

        } else if (sc.status == "deleted") {
          (await this.apiService.deleteSchool(sc.id)).subscribe((data: any) => {
            if (data) {
              console.log(data);
            }
          });
         
        }else if(sc.status =="updated" && sc.created_at && sc.updated_at){
          const schoolPromise = this.apiService.updateSchool(sc);
          const schoolObservable = await schoolPromise;
          const school = await lastValueFrom(schoolObservable).then((data: any) => {
            console.log(data.data);
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

        }else if (cl.status==="updated" && cl.created_at && cl.updated_at){
          const classPromise = this.apiService.updateClasse(cl.schoo_id, cl);
          const classObservable = await classPromise ;
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

        }else if (st.status == "deleted") {
          (await this.apiService.deleteStudent(st.id)).subscribe((data: any) => {
            if (data) {
              console.log(data);
            }
          });
        }else if(st.status=="updated" &&  st.created_at && st.updated_at){
          const studentPromise = this.apiService.updateStudent(st);
          const studentObservable = await studentPromise;
          const std = await lastValueFrom(studentObservable).then((data: any) => {
            console.log(data.data);
          });
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

    //verifie s'il y a des examens à synchroniser
    let exams = await this.appStorage.get('exams');
    let examsData = await this.appStorage.get('exams-data');
    let evaluations = await this.appStorage.get('evaluations');
    if (exams) {
      for (let ex of exams) {
        if (!ex.created_at && !ex.updated_at) {
          const examPromise = this.apiService.postExam(ex); // Stockez la Promise
          const examObservable = await examPromise; // Récupérez l'Observable
          const exam = await lastValueFrom(examObservable).then(async (data: any) => {
            if (examsData) {
              for (let ed of examsData) {
                if (!ed.created_at && !ed.updated_at && ed.examination_id == data.id) {
                  const examDataPromise = this.apiService.postExamData(data.id, ed); // Stockez la Promise
                  const examDataObservable = await examDataPromise; // Récupérez l'Observable
                  const examData = await lastValueFrom(examDataObservable);
                }
              }
            }

            if (evaluations) {
              for (let ev of evaluations) {
                if (!ev.created_at && !ev.updated_at && ev.examination_id == data.id) {
                  const evaluationPromise = this.apiService.postEvaluation(data.id, ev); // Stockez la Promise
                  const evaluationObservable = await evaluationPromise; // Récupérez l'Observable
                  const evaluation = await lastValueFrom(evaluationObservable);
                }
              }
            }
          });

        }
      }
    }



  }


  async loadAllData() {
    try {
      const usersPromise = this.apiService.getUsers();
      const usersObservable = await usersPromise ;
      const users:any= await lastValueFrom(usersObservable).then((data:any) =>{
        this.appStorage.set('users', data.data);
      });



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

              

            }
          });


        }

        this.appStorage.set('classes', cls);

      }

      //load all exams
      const examsPromise = this.apiService.getExams(); // Stockez la Promise
      const examsObservable = await examsPromise; // Récupérez l'Observable
      const exams: any = await lastValueFrom(examsObservable).then((data: any) => {
        if (data.data) {
          this.appStorage.set('exams', data.data);
        }
      });

      //load all exams data by exams
      const exms = await this.appStorage.get('exams');
      if (exms) {
        let exmData: any[] = [];
        for (let exam of exms) {
          const examsDataPromise = this.apiService.getExamData(exam.id); // Stockez la Promise
          const examsDataObservable = await examsDataPromise; // Récupérez l'Observable
          const examsData: any = await lastValueFrom(examsDataObservable).then((dt: any) => {
            if (dt && dt.data && dt.data.length > 0) {
              for (let ed of dt.data) {
                exmData.push(ed);
              }

              

            }
          });
        }

        this.appStorage.set('exams-data', exmData);
      }

      //load all evaluations by exams
      const exms2 = await this.appStorage.get('exams');
      if (exms2) {
        let evs: any[] = [];
        for (let exam of exms2) {
          const evaluationsPromise = this.apiService.getEvaluations(exam.id); // Stockez la Promise
          const evaluationsObservable = await evaluationsPromise; // Récupérez l'Observable
          const evaluations: any = await lastValueFrom(evaluationsObservable).then((dt: any) => {
            if (dt && dt.data && dt.data.length > 0) {
              for (let ev of dt.data) {
                evs.push(ev);
              }

              

            }
          });
        }

        this.appStorage.set('evaluations', evs);
      }

    } catch (e) {
      console.log(e);
    }




  }

  goToSyncData(){
    this.router.navigate(['tabs/account/sync-data']);
  }

  goToEditProfile() {
    this.router.navigate(['tabs/account/edit-profil']);
  }

  goToChangePassword() {
    this.router.navigate(['tabs/account/change-password']);
  }

  goToManageUsers() {
    this.router.navigate(['tabs/account/manage-users']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  async logOut() {
    await this.appStorage.remove('authToken');
    await this.appStorage.remove('user');
    await this.appStorage.remove('roles');
    /* await this.appStorage.remove('classes');
    await this.appStorage.remove('students');
    await this.appStorage.remove('schools');
    await this.appStorage.remove('schoolYears');
    await this.appStorage.remove('exams');
    await this.appStorage.remove('evaluations'); */

    this.router.navigate(['/login'], { replaceUrl: true });


  }

}
