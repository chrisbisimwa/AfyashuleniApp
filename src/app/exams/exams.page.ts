import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-exams',
  templateUrl: 'exams.page.html',
  styleUrls: ['exams.page.scss']
})
export class ExamsPage {
  exams: any[] = [];
  segment = "Unresolved"
  user:any={};
  users: any[]=[];



  constructor(private appStrorage: Storage, private navController: NavController,
    private toastCtrl: ToastController,
    public plt: Platform) {
      this.fetchUser().then(()=>{
        this.fetchExams();
      });
    
  }

  async fetchUser(){
    this.user= await this.appStrorage.get('user');
    this.users= await this.appStrorage.get('users');
  }


  async fetchExams(refresher?: any) {


    //fetch exams from local storage
    const exams = await this.appStrorage.get('exams');
    const exs = [];
    if (exams) {
      for (let exam of exams) {
        if (this.getExaminerGroupIdByExaminerId(exam.examiner_id) === this.user.group_id) {
          exam.studentName = await this.getstudentNameById(exam.student_id);
          exam.examinerName = await this.getExaminerNameById(exam.examiner_id);
          exs.push(exam);
        }

      }

      this.exams = exs;
    } else[
      this.exams = []
    ]


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

    let examiner = null;
    if (this.users) {
      examiner = this.users.find((item: any) => item.id === id);
    }

    return examiner.group_id ;
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
