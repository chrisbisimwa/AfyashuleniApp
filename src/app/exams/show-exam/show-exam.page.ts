import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-show-exam',
  templateUrl: './show-exam.page.html',
  styleUrls: ['./show-exam.page.scss'],
})
export class ShowExamPage implements OnInit {

  exam: any = null;
  examDatas: any = null;
  evaluations: any = null;
  exams: any = null;
  userRoles: String[] = [];
  user: any;
  isMedecin: boolean = false;
  isNurse: boolean = false;

  constructor(
    private appStorage: Storage,
    private route: ActivatedRoute,
    private navController: NavController,
    private datePipe: DatePipe
  ) { 
    this.fetchUser().then(() => {
      this.fetchRoles().then(() => {
        if (this.userRoles.includes('infirmier')) {
          this.isNurse = true;
         
        } else if (this.userRoles.includes('Medecin')) {
          this.isMedecin = true;
          
        }
      });
    });
  }

  async ngOnInit() {
    try {
      await this.fetchExam();
      await this.fetchEvaluations();
    } catch (error) {
      console.error('Error fetching exam:', error);
    }
    
  }

  async fetchExam() {
    const result = await this.appStorage.get('exams');
    if (result) {
      this.exam = result.find((exa: any) => exa.id == this.route.snapshot.params['id']);

      if (this.exam) {
        this.exam.studentName = await this.getstudentNameById(this.exam.student_id);
        this.exam.examinerName = await this.getExaminerNameById(this.exam.examiner_id);
        this.exam.doctorName = await this.getExaminerNameById(this.exam.doctor_id);
        let xx = JSON.parse(this.exam.data);
        let data = [];
        for (let i in xx) {
          let type = i;
          let dt = xx[i];
          let rs = [];
          for (let j in dt) {
            rs.push({ question: j, answer: dt[j] });
          }
          data.push({ type: type, dt: rs });
        }
        this.exam.data = data;
      }
    }


  }

  async fetchEvaluations(){
    try {
      const result = await this.appStorage.get('evaluations');
      if (result) {
        this.evaluations = result.filter((eva: any) => eva.examination_id == this.route.snapshot.params['id']);

        console.log('Evaluations:', this.evaluations);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  }

  async getstudentNameById(id: any) {
    let students = await this.appStorage.get('students');

    let student = null;
    if (students) {
      student = students.find((item: any) => item.id === id);
    }

    return student ? student.first_name + ' ' + student.last_name + ' ' + student.surname : 'Unknown';
  }

  async getExaminerNameById(id: any) {
    let examiners = await this.appStorage.get('users');

    let examiner = null;
    if (examiners) {
      examiner = examiners.find((item: any) => item.id === id);
    }

    return examiner ? examiner.name : 'Unknown';
  }



  deleteModal(exam: any) {
  }

  open(exam: any) {
  }

  hasExamenClinique() {
    if (this.exam && this.exam.doctor_id) {
      return true;
    }
    return false;
  }

  async new() {
    if(this.exam && this.exam.student_id){
      this.navController.navigateForward('/tabs/exams/new/'+this.exam.student_id);
    }
    
  }

  previousState() {
    this.navController.navigateBack('/tabs/exams');
  }

  async fetchUser() {
    this.user = await this.appStorage.get('user') || {};
    return this.user;
  }

  async fetchRoles() {
    this.userRoles = await this.appStorage.get('roles') || [];

  }


}
