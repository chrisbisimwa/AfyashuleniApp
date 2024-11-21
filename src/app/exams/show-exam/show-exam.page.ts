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
  exams: any = null;
  constructor(
    private appStorage: Storage,
    private route: ActivatedRoute,
    private navController: NavController,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.fetchExam().then(() => {
      this.fetchExamData();
    });
  }

  async fetchExam() {
    //fetch exam from local storage
    const result = await this.appStorage.get('exams');
    if(result) {
      this.exam = result.find((exa: any) => exa.id == this.route.snapshot.params['id']);
      if(this.exam) {
        this.exam.studentName = await this.getstudentNameById(this.exam.student_id);
        this.exam.examinerName = await this.getExaminerNameById(this.exam.examiner_id);
      }
    }

  }

  async fetchExamData() {
    //fetch exam from local storage
    const exams = await this.appStorage.get('exams');
    
    let ex= exams.find((exa: any) => exa.id == this.route.snapshot.params['id']);


    let result: any[] = [];
    if(ex){
      
      if(exams){
        result = exams.filter((exa: any) => exa.code === ex.code);
      }
      
    }
    
    console.log(result);
    this.exams = result ? result : [];

    /* const examDataStore = await this.appStorage.get('exams-data');

    let exDatas=[]
    if(result){
      let dtx=[]
      for( let examen of result){
        
        if(examDataStore){
          dtx = examDataStore.filter((exa: any) => exa.examination_id === examen.id);

          console.log(dtx);
          if(dtx){
            exDatas.push({'examen':examen.type, 'data':dtx});
          }

        }
        
      }

    }
    console.log(exDatas);


    this.examDatas = exDatas ? exDatas : []; */

  }

  async getstudentNameById(id: any) {
    let students = await this.appStorage.get('students');

    let student = null;
    if(students){
      student = students.find((item: any) => item.id === id);
    }

    return student ? student.first_name+' '+student.last_name+' '+student.surname : 'Unknown';
  }

  async getExaminerNameById(id: any) {
    let examiners = await this.appStorage.get('users');

    let examiner = null;
    if(examiners){
      examiner = examiners.find((item: any) => item.id === id);
    }

    return examiner ? examiner.name : 'Unknown';
  }

 

  deleteModal(exam:any) {
  }

  open(exam: any) {
  }

  async new() {
    await this.navController.navigateForward('/tabs/exams/new');
  }


}
