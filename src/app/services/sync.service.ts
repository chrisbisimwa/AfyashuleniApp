import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DataService } from './data.service';
import { lastValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  studentCode: any;
  studentId: any;
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

            }
          }
        }
      });

      this.dataService.get('classes').then(async (data) => {
        if (data) {
          for (let ds of data) {
            if (!ds.id && !ds.created_at) {
              const classPromise = this.apiService.postClass(ds); // Stockez la Promise
              const classObservable = await classPromise; // Récupérez l'Observable
              const classs = await lastValueFrom(classObservable);
            }
          }
        }
      });

      this.dataService.get('students').then(async (data) => {
        if (data && data.data) {
          for (let ds of data.data) {
            if (!ds.id && !ds.created_at) {
              const studentPromise = this.apiService.postStudent(ds); // Stockez la Promise
              const studentObservable = await studentPromise; // Récupérez l'Observable
              const student: any = await lastValueFrom(studentObservable);

              this.getStudentIdByCode(student.code);

            }
          }
        }
      });

      this.dataService.get('student-history').then(async (data) => {
        if (data) {
          for (let ds of data) {
            if (!ds.id && !ds.created_at && ds.student_code) {
              ds.student_id = await this.getStudentIdByCode(ds.student_code);
              if (ds.student_id) {
                const studentHistoryPromise = this.apiService.postStudentHistory(ds); // Stockez la Promise
                const studentHistoryObservable = await studentHistoryPromise; // Récupérez l'Observable
                const studentHistory: any = await lastValueFrom(studentHistoryObservable);
                if (studentHistory.data) {
                  //remove student history from local storage
                  this.dataService.remove('student-history');

                  const schYr = await this.dataService.get('schoolYears');
                  if (schYr.data.length > 0) {
                    let ht: any = [];
                    let hs = await this.dataService.get('student-history');
                    if (!hs) {
                      ht = [];
                    } else {
                      for (let d of hs) {
                        if (!d.id && !d.created_at && d.student_code) {
                          ht.push(d);
                        }
                      }
                    }

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


                }

              }


            }
          }
        }
      });

      const schoolYearsPromise = this.apiService.getSchoolYears(); // Stockez la Promise
      const schoolYearsObservable = await schoolYearsPromise; // Récupérez l'Observable
      const schoolYears = await lastValueFrom(schoolYearsObservable);

      this.dataService.set('schoolYears', schoolYears);

      const schoolsPromise = this.apiService.getSchools(); // Stockez la Promise
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
        let ht: any = [];
        let hs = await this.dataService.get('student-history');
        if (!hs) {
          ht = [];
        } else {
          for (let d of hs) {
            if (!d.id && !d.created_at && d.student_code) {
              ht.push(d);
            }
          }
        }

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

  // method to get student id by student code
  async getStudentIdByCode(code: string) {
    const students = await this.dataService.get('students');
    if (students && students.data) {
      const student = students.data.find((std: any) => std.code === code);
      if (student) {
        return student.id;
      }
    }
    return null;
  }
}
