import { Component } from '@angular/core';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-exams',
  templateUrl: 'exams.page.html',
  styleUrls: ['exams.page.scss']
})
export class ExamsPage {
  exams: any[] = [];
  segment = "Unresolved"
  user: any = {};
  users: any[] = [];



  constructor(private appStrorage: Storage, 
    private navController: NavController,
    private toastCtrl: ToastController,
    public plt: Platform,
    private datePipe: DatePipe
  
  ) {
    this.fetchUser().then(() => {
      this.fetchExams(null, this.user);
    });

  }

  async fetchUser() {
    this.user = await this.appStrorage.get('user');
    this.users = await this.appStrorage.get('users');
  }

  reload(refresher: any) {
    this.fetchUser().then(() => {
      if(this.user){
        this.fetchExams(refresher, this.user);
      }

      
    });

    if (refresher) {
      refresher.target.complete();
    }
  }


  async fetchExams(refresher?: any, user?: any) {
    

    //fetch exams from local storage
    const exams = await this.appStrorage.get('exams');
    const exs = [];
    if (exams) {
      for (let exam of exams) {
        if (this.getExaminerGroupIdByExaminerId(exam.examiner_id) === user.group_id) {
          exam.studentName = await this.getstudentNameById(exam.student_id);
          exam.examinerName = await this.getExaminerNameById(exam.examiner_id);
          //grouper les examens par examinateur et élève: si l'examen a un même examinateur et un même élève et à une même date, considérer que c'est un seul et même examen
          let found = exs.find((item: any) => item.student_id === exam.student_id && item.examiner_id === exam.examiner_id && this.datePipe.transform(item.date, 'yyyy-MM-dd') === this.datePipe.transform(exam.date, 'yyyy-MM-dd'));

          if (!found) {
            exs.push(exam);
          }


        }

      }

      this.exams = exs;


    } else {
      this.exams = []
    }


    

  }

  async getstudentNameById(id: any) {
    let students = await this.appStrorage.get('students');

    let student = null;
    if (students) {
      student = students.find((item: any) => item.id === id);
    }

    return student ? student.first_name + ' ' + student.last_name + ' ' + student.surname : 'Unknown';
  }

  getExaminerGroupIdByExaminerId(id: any) {

    console.log('users', this.users);
    let examiner = null;
    if (this.users) {
      examiner = this.users.find((item: any) => item.id === id);
    }

    if(examiner){
    return examiner.group_id;
    }else{
      return 0;
    }
  }

  async getExaminerNameById(id: any) {
    let examiners = await this.appStrorage.get('users');

    let examiner = null;
    if (examiners) {
      examiner = examiners.find((item: any) => item.id === id);
    }

    return examiner ? examiner.name : 'Unknown';
  }

  segmentChanged(event: any) {
    this.fetchExams(null);
  }

  search(query: any, refresher?: any) {
    if (!query) {
      this.fetchExams(refresher);

    } else {

      let result = this.exams.filter(item =>
        Object.keys(item).some(k => item[k] != null &&
          item[k].toString().toLowerCase()
            .includes(query.toLowerCase()))
      );

      this.exams = result;

    }
  }

  async resolve(item: IonItemSliding, exam: any) {
    await this.navController.navigateForward('/tabs/entities/customer/' + exam.id + '/edit');
    await item.close();
  }

  async new() {
    await this.navController.navigateForward('/tabs/exams/new');
  }

  async view(examId: any) {
    await this.navController.navigateForward('/tabs/exams/' + examId + '/view');

  }
  async edit(item: IonItemSliding, site: any) {
    await this.navController.navigateForward('/tabs/entities/customer/' + site.id + '/edit');
    await item.close();
  }

  async delete(customer: any) {
    /*  this.customerService.delete(customer.id).subscribe(
       async () => {
         const toast = await this.toastCtrl.create({ message: 'Customer deleted successfully.', duration: 3000, position: 'middle' });
         await toast.present();
         await this.loadAll();
       },
       error => console.error(error)
     ); */
  }





}
