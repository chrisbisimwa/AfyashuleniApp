import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-show-student',
  templateUrl: './show-student.page.html',
  styleUrls: ['./show-student.page.scss'],
})
export class ShowStudentPage implements OnInit {
  student: any = null;
  studenClass: any = null;
  studentSchool: any = null;
  studentExams: any = null;
  studentExamData:any = null;
  studentEvaluations: any = null;
  isEvalModalOpen: boolean;
  problems: { id: number, name: string }[];
  isExamModalOpen: boolean;

  constructor(
    private navController: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private appStorage: Storage
  ) { }

  ngOnInit() {
    this.fetchProblems();
    this.fetchStudent().then(() => {
      this.fetchExams().then(() => {
        this.fetchEvaluation();
        this.fetchExamData();
      });
    });
    this.fectClasse().then(() => {
      this.fetchSchool();
    });

  }

  async fetchProblems() {
    const problems = await this.appStorage.get('problems');
    this.problems = problems;
  }

  async fetchStudent() {
    const id = this.route.snapshot.params['id'];
    const students = await this.appStorage.get('students');
    const student = students.find((item: { id: any; }) => item.id == id);
    this.student = student;
  }

  async fetchExams() {
    const exams = await this.appStorage.get('exams');
    const studentExams = exams.filter((item: { student_id: any; }) => item.student_id == this.student.id);
    this.studentExams = studentExams;
  }

  async fetchEvaluation() {
    const evaluations = await this.appStorage.get('evaluations');
    const studentEvaluations = [];
    for (let exam of this.studentExams) {
      const evaluation = evaluations.filter((item: { examination_id: any; }) => item.examination_id == exam.id);
      if (evaluation.length > 0) {
        for (let e of evaluation) {
          e.problem_name = this.getProblemNameById(e.problem_id);
          studentEvaluations.push(e);
        }
      }

    }
    this.studentEvaluations = studentEvaluations;
  }

  async fetchExamData() {
    const result = await this.appStorage.get('exams-data');
    //filter examdata by examination_id for all student exams
    for (let exam of this.studentExams) {
      const studentExamData = result.filter((item: { examination_id: any; }) => item.examination_id == exam.id);
      exam.data = studentExamData;
    }
  }

  async fectClasse() {
    if (this.student) {
      const classes = await this.appStorage.get('classes');
      const classe = classes.find((item: { id: any; }) => item.id == this.student.current_class_id);
      this.studenClass = classe;
    }

  }

  async fetchSchool() {
    if (this.studenClass) {
      const schools = await this.appStorage.get('schools');
      const school = schools.find((item: { id: any; }) => item.id == this.studenClass.school_id);
      this.studentSchool = school;
    }


  }

  editStudent() {
    this.navController.navigateForward(`/edit-student/${this.student.id}`);
  }

  getProblemNameById(problem_id: number) {
    if (this.problems) {
      const problem = this.problems.find(p => p.id === problem_id);

      return problem ? problem.name : 'Unknown';
    }else{
      return 'Unkown'
    }

  }

  async deleteModal() {
    console.log('delete');
    const alert =  await this.alertController.create({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer cet élève?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Supprimer',
          handler: async () => {
            const students = await this.appStorage.get('students');
            const student = students.find((item: { id: any; }) => item.id == this.student.id);
            if (student) {
              students.splice(students.indexOf(student), 1);
              student.status = 'deleted';
              students.push(student);
              this.appStorage.set('students', students);
              this.navController.navigateBack('/tabs/schools/classe/'+this.student.current_class_id+'/view');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  setOpenEval(isOpen: boolean) {
    this.isEvalModalOpen = isOpen;
  }

  setOpenExam(isOpen: boolean) {
    console.log('setOpenExam', isOpen);
    this.isExamModalOpen = isOpen;
  }

  examiner(){
    this.navController.navigateForward('/tabs/exams/new/'+this.student.id);
  }

}
