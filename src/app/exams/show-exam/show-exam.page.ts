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
  constructor(
    private appStorage: Storage,
    private route: ActivatedRoute,
    private navController: NavController
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
    //grouper les examens par examinateur et élève: si l'examen a un même examinateur et un même élève et à une même date, considérer que c'est un seul et même examen
    let result: any[] = [];
    if(exams) {
      for (let exam of exams) {
        let found = result.find((item: any) => item.student_id === exam.student_id && item.examiner_id === exam.examiner_id && item.date === exam.date);
        if(!found){
          result.push(exam);
        }
      }
    }

    const examDataStore = await this.appStorage.get('exams-data');

    let exDatas=[]
    if(result){
      for( let examen of result){
        let dtx=[]
        for(let examData of examDataStore){
          if(examData.examination_id==examen.id){
             dtx.push(examData);
          }
        }

        if(dtx.length>0){
          exDatas.push({ 'examen': examen.type, 'data': dtx});
        }
        
      }
    }

    this.examDatas = exDatas ? exDatas : [];

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
