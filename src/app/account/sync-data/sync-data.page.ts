import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { Network, ConnectionStatus } from '@capacitor/network';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-sync-data',
  templateUrl: './sync-data.page.html',
  styleUrls: ['./sync-data.page.scss'],
})
export class SyncDataPage implements OnInit {
  loading: HTMLIonLoadingElement | null = null;
  networkStatus: ConnectionStatus;

  classes: any = null;
  classesToSync: any = [];
  schoolToSync: any = [];
  students: any = null;
  studentsToSync: any = [];
  exams: any = null;
  examsToSync: any = [];
  schools: any = [];
  user: any = null;



  constructor(
    private appStorage: Storage,
    private loadingCtrl: LoadingController,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {
  }

  ngOnInit() {
    this.refreshData();


    this.checkLogin().then(() => {
      this.checkNetwork().then(() => {
        //this.loadExamsFromAPI();
      });
    });

    this.fetUser();
  }



  async checkLogin() {
    this.appStorage.get('authToken').then(async token => {
      if (token) {
        //check if the token is still valid
        let tokenData = await this.apiService.checkTokenValidity();
        if (tokenData) {

        } else {
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
          //check if there is data to sync
        }


      });

      Network.addListener('networkStatusChange', (status) => {
        this.networkStatus = status;

        if (this.networkStatus.connected) {
          //check if there is data to sync
        }

      });


    }
  }

  loadClassesFromStorage() {
    this.classesToSync = [];
    this.appStorage.get('classes').then((data) => {
      this.classes = data || [];

      for (let classe of this.classes) {
        if (!classe.created_at || classe.status === 'updated' || classe.status === 'deleted') {
          this.classesToSync.push(classe);
        }
      }

    });


  }

  loadStudentsFromStorage() {
    this.studentsToSync = [];
    this.appStorage.get('students').then((data) => {
      this.students = data || [];

      for (let student of this.students) {
        if (!student.created_at || student.status === 'updated' || student.status === 'deleted') {
          this.studentsToSync.push(student);
        }
      }

    });
  }

  loadSchoolsFromStorage() {
    this.schools = [];
    this.appStorage.get('schools').then((data) => {
      this.schools = data || [];

      for(let school of this.schools){
        if(!school.created_at || school.status==="updated" || school.status==="deleted"){
          this.schoolToSync.push(school);
        }
      }

    });
  }

  loadExamsFromStorage() {
    this.examsToSync = [];
    this.appStorage.get('exams').then((data) => {
      this.exams = data || [];

      for (let exam of this.exams) {
        if (!exam.created_at || exam.status === 'updated' || exam.status === 'deleted') {
          this.examsToSync.push(exam);
        }
      }

    });
  }

 



  syncClasses() {
    this.presentLoading('Synchronisation des classes en cours...');
    setTimeout(() => {
      this.dismissLoading();
    }, 60000);


    Network.getStatus().then(async status => {
      this.networkStatus = status;
      if (this.networkStatus.connected) {
        this.storeClasses().then(() => {
          console.log('Classes synchronisées');
          this.loadClassesFromAPI();
        });
      } else {
        this.presentAlert('Veuillez vérifier votre connexion internet');
      }
    });
  }

  async storeClasses() {
    for (let classe of this.classesToSync) {
      if (!classe.created_at) {
        const classPromise = this.apiService.postClass(classe.school_id, classe);
        const classObservable = await classPromise;
        const cls = await lastValueFrom(classObservable).then((data: any) => {
          //
        });
      }

      if (classe.status === 'updated') {
        const schoolPromise = this.apiService.updateSchool(classe);
        const schoolObservable = await schoolPromise;
        const school = await lastValueFrom(schoolObservable).then((data: any) => {
          console.log(data.data);
        });
      }

      if (classe.status === 'deleted') {
        (await this.apiService.deleteSchool(classe.id)).subscribe((data: any) => {
          if (data) {
            console.log(data);
          }
        });
      }

    }
  }

  syncStudents() {
    this.presentLoading('Synchronisation des élèves en cours...');
    setTimeout(() => {
      this.dismissLoading();
    }, 60000);


    Network.getStatus().then(async status => {
      this.networkStatus = status;
      if (this.networkStatus.connected) {
        for (let student of this.studentsToSync) {
          if (!student.created_at) {
            const studentPromise = this.apiService.postStudent(student);
            const studentObservable = await studentPromise;
            const std = await lastValueFrom(studentObservable).then((data: any) => {
              if (data && data.data) {
                this.loadStudentsFromAPI().then(() => {
                  this.syncStudentsHistory().then(async () => {
                    let stdsHist: any[] = [];
                    /* let classes: any[] = await this.appStorage.get('classes');
                    let stdsHist: any[] = [];
                    let classId = student.current_class_id;
                    if (classId) {
                      if (classes) {
                        let schoolYearId = classes.find((item: any) => item.id === classId).schoolYear_id;
                        if (schoolYearId) {
                          const studentHistPromise = this.apiService.getStudentHistory(schoolYearId);
                          const studentHistObservable = await studentHistPromise;
                          const studentHist: any = await lastValueFrom(studentHistObservable).then((data: any) => {
                            if (data.data && data.data.length > 0) {
                              for (let hist of data.data) {
                                stdsHist.push(hist);
                              }
                            }

                          });
                        }
                      }

                    } */

                    const studentHistoryPromise = this.apiService.getStudentHistory(1);
                    const studentHistoryObservable = await studentHistoryPromise;
                    const studentHistory: any = await lastValueFrom(studentHistoryObservable).then((data: any) => {
                      if (data.data && data.data.length > 0) {
                        for (let hist of data.data) {
                          stdsHist.push(hist);
                        }
                      }

                    });

                    this.appStorage.set('student-history', stdsHist);
                  });
                });
              }

            });
          }

          if (student.status === 'updated') {
            const studentPromise = this.apiService.updateStudent(student);
            const studentObservable = await studentPromise;
            const std = await lastValueFrom(studentObservable);
          }

          if (student.status === 'deleted') {
            (await this.apiService.deleteStudent(student.id)).subscribe((data: any) => {
              if (data) {
                console.log(data);
              }
            });
          }

        }
      }
    });
  }

  async syncStudentsHistory() {

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

  syncExams() {
    this.presentLoading('Synchronisation des examens en cours...');
    setTimeout(() => {
      this.dismissLoading();
    }, 60000);


    Network.getStatus().then(async status => {
      this.networkStatus = status;
      if (this.networkStatus.connected) {
        let counter = 0;
        for (let exam of this.examsToSync) {
          if (!exam.created_at) {
            const examPromise = this.apiService.postStudentExamination(exam.student_id, exam);
            const examObservable = await examPromise;
            const exm = await lastValueFrom(examObservable).then((data: any) => {
              //console.log(data);
              if (data && data.data) {
                counter++;
              }
            });


          }

          if (exam.status === 'updated') {

          }

          if (exam.status === 'deleted') {

          }

        }

        //if all exams are synced, sync evaluations
        if (counter == this.examsToSync.length) {
          this.loadExamsFromAPI().then(() => {
            this.syncEvaluation().then(async () => {
              for (let exam of this.exams) {
                const evalPromise = this.apiService.getEvaluations(exam.id);
                const evalObservable = await evalPromise;
                const ev = await lastValueFrom(evalObservable).then((data: any) => {
                  if (data.data && data.data.length > 0) {
                    this.appStorage.set('evaluations', data.data);
                  }
                });
              }
              this.dismissLoading();
            });
          });
        }



      }else{
        this.presentAlert('Veuillez vérifier votre connexion internet');
      }

    });
  }

  async syncEvaluation() {
    let evaluations: any[] = await this.appStorage.get('evaluations');
    if (evaluations) {
      for (let evaluation of evaluations) {
        if (!evaluation.created_at) {
          const evaluationPromise = this.apiService.postEvaluation(evaluation.examination_id, evaluation);
          const evaluationObservable = await evaluationPromise;
          const evalu = await lastValueFrom(evaluationObservable).then((data: any) => {
            if (data && data.data) {
              console.log(data);
            }
          });
        }
      }
    }



  }



  async loadClassesFromAPI() {
    this.presentLoading('Chargement des classes en cours...');
    /* setTimeout(() => {
      this.dismissLoading();
    }, 60000); */

    let cls: any[] = [];
    this.appStorage.get('schools').then(async (data) => {

      if (data.length > 0) {
        for (let school of data) {
          const classesPromise = this.apiService.getClasses(school.id);
          const classesObservable = await classesPromise;
          const classes: any = await lastValueFrom(classesObservable).then((data: any) => {
            if (data.data && data.data.length > 0) {
              for (let classe of data.data) {
                cls.push(classe);
              }
            }
          });
        }


        this.classes = cls;
        this.appStorage.set('classes', cls);
        this.refreshData();
        this.dismissLoading();
      }

    });





  }

  async loadStudentsFromAPI() {
    let stds: any[] = [];
    let classes: any[] = await this.appStorage.get('classes') || [];
    let stdsHist: any[] = [];
    for (let classe of classes) {
      const studentsPromise = this.apiService.getStudents();
      const studentsObservable = await studentsPromise;
      const students: any = await lastValueFrom(studentsObservable).then((data: any) => {
        if (data.data && data.data.length > 0) {
          for (let student of data.data) {
            if (student.current_class_id == classe.id) {
              stds.push(student);
            }
          }
        }

      });
    }

    this.appStorage.set('students', stds);


    this.dismissLoading();

  }

  async loadExamsFromAPI() {

    let exs: any[] = [];
    let students: any[] = await this.appStorage.get('students');
    for (let student of students) {
      const examsPromise = this.apiService.getStudentExaminations(student.id);
      const examsObservable = await examsPromise;
      const exams: any = await lastValueFrom(examsObservable).then((data: any) => {
        if (data.data && data.data.length > 0) {
          //console.log(data.data);
          for (let exam of data.data) {
            exs.push(exam);
            
          }
        }

      });
    }

    

    this.appStorage.set('exams', exs);
    this.dismissLoading();

  }

  async loadSchoolsFormAPI() {
    this.presentLoading('Chargement des écoles en cours...');
    /* setTimeout(() => {
      this.dismissLoading();
    }, 60000); */



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
        this.appStorage.set('schools', data.data.filter((item: any) => item.group_id == this.user.group_id));

      }
    });


    const usersPromise = this.apiService.getUsers();
    const usersObservable = await usersPromise;
    const users: any = await lastValueFrom(usersObservable).then((data: any) => {
      this.appStorage.set('users', data.data);
      
    });


    //check if there is classes to sync
    this.classesToSync = [];
    this.appStorage.get('classes').then((data) => {
      this.classes = data || [];

      for (let classe of this.classes) {
        if (!classe.created_at || classe.status === 'updated' || classe.status === 'deleted') {
          this.classesToSync.push(classe);
        }
      }

    });


    if (this.classesToSync.length == 0) {
      console.log('Classes to sync', this.classesToSync);
      this.loadClassesFromAPI();
    }

    //check if there is students to sync
    this.studentsToSync = [];
    this.appStorage.get('students').then((data) => {
      this.students = data || [];

      for (let student of this.students) {
        if (!student.created_at || student.status === 'updated' || student.status === 'deleted') {
          this.studentsToSync.push(student);
        }
      }

    });

    if (this.studentsToSync.length == 0) {
      this.loadStudentsFromAPI();
    }

    //check if there is exams to sync
    this.examsToSync = [];
    this.appStorage.get('exams').then((data) => {
      this.exams = data || [];

      for (let exam of this.exams) {
        if (!exam.created_at || exam.status === 'updated' || exam.status === 'deleted') {
          this.examsToSync.push(exam);
        }
      }

    });

    if (this.examsToSync.length == 0) {
      this.loadExamsFromAPI();
    }

    this.refreshData();

    this.dismissLoading();

  }

  refreshData() {
    this.loadSchoolsFromStorage();
    this.loadClassesFromStorage();
    this.loadStudentsFromStorage();

    this.loadExamsFromStorage();

    //this.loadClassesFromAPI();


  }

  async fetUser() {
    this.appStorage.get('user').then((val) => {
      this.user = val;
    });
  }

  async presentLoading(msg: string) {
    this.loading = await this.loadingCtrl.create({
      message: msg,
      duration: 5000,
    });

    this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  handleRefresh(event: any) {
    this.refreshData();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  previousState(){
    this.router.navigate(['/tabs/account']);
  }

}
