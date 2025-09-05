import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  studentExamData: any = null;
  studentEvaluations: any = null;
  problems: { id: number, name: string }[];
  isEvalModalOpen: boolean = false;
  isExamModalOpen: boolean = false;

  constructor(
    private navController: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private appStorage: Storage,
    private router: Router
  ) { }

  async ngOnInit() {
    await Promise.all([
      this.fetchProblems(),
      this.fetchStudent()
    ]);

    if (this.student) {
      await this.fetchExams();
      await this.fetchEvaluation();
      await this.fetchExamData();
      await this.fetchClasse();
      await this.fetchSchool();
    }

  }

  async fetchProblems() {
    this.problems = await this.appStorage.get('problems') || [];
  }

  async fetchStudent() {
    const id = this.route.snapshot.params['id'];
    const students = await this.appStorage.get('students') || [];
    this.student = students.find((item: { id: any; status?: string; }) => item.id == id && item.status != 'deleted');
  }

  async fetchExams() {
    const exams = await this.appStorage.get('exams') || [];
    this.studentExams = exams.filter((item: { student_id: any; }) => item.student_id == this.student.id);
  }

  async fetchEvaluation() {
    if (!this.studentExams) return;
    const evaluations = await this.appStorage.get('evaluations') || [];
    const studentEvaluations = [];
    for (const exam of this.studentExams) {
      const evaluation = evaluations.filter((item: { examination_id: any; }) => item.examination_id == exam.id);
      if (evaluation.length > 0) {
        for (const e of evaluation) {
          e.problem_name = this.getProblemNameById(e.problem_id);
          try {
            e.localisations = JSON.parse(e.localisations);
          } catch (error) {
            e.localisations = {}; // Gérer le cas où le JSON est invalide
          }
          studentEvaluations.push(e);
        }
      }
    }
    this.studentEvaluations = studentEvaluations;
  }

  async fetchExamData() {
    if (!this.studentExams) return;
    const allExamData = [];
    for (const exam of this.studentExams) {
      try {
        const xx = JSON.parse(exam.data);
        const data = [];
        for (const i in xx) {
          const type = i;
          const dt = xx[i];
          const rs = [];
          for (const j in dt) {
            rs.push({ question: j, answer: dt[j] });
          }
          data.push({ type: type, dt: rs });
        }
        allExamData.push(...data); // Ajouter les données de chaque examen
      } catch (error) {
        console.error("Erreur de parsing JSON pour les données d'examen:", error);
      }
    }
    this.studentExamData = allExamData;
  }

  async fetchClasse() {
    if (this.student) {
      const classes = await this.appStorage.get('classes') || [];
      this.studenClass = classes.find((item: { id: any; }) => item.id == this.student.current_class_id);
    }
  }

  async fetchSchool() {
    if (this.studenClass) {
      const schools = await this.appStorage.get('schools') || [];
      this.studentSchool = schools.find((item: { id: any; }) => item.id == this.studenClass.school_id);
    }
  }

  editStudent() {
    this.navController.navigateForward(`/tabs/schools/classe/student/${this.student.id}/edit`);
  }

  getProblemNameById(problem_id: number) {
    if (this.problems) {
      const problem = this.problems.find(p => p.id === problem_id);

      return problem ? problem.name : 'Unknown';
    } else {
      return 'Unkown'
    }

  }

  async deleteModal() {
    console.log('delete');
    const alert = await this.alertController.create({
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
              if (student.created_at) {
                students.splice(students.indexOf(student), 1);
                student.status = 'deleted';
                students.push(student);
              } else {
                students.splice(students.indexOf(student), 1);
              }

              this.appStorage.set('students', students);
              this.navController.navigateForward('/tabs/schools/classe/' + student.current_class_id + '/view');
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
    this.isExamModalOpen = isOpen;
  }

  previousState() {
    this.navController.navigateBack('/tabs/schools/classe/' + this.student.current_class_id + '/view');
  }

  examiner() {
    this.navController.navigateForward('/tabs/exams/new/' + this.student.id);
  }

  getProblemLocalisationByID(problem_id: number) {
    const evalu = this.studentEvaluations.find((p: any) => p.id === problem_id);
    if (!evalu) return null;

    //formater les localisations en string, retirer les espaces en trop et les {}
    let locs = Object.entries(evalu.localisations).map(([key, value]) => `${this.formatLabel(key)}: ${value}`).join(', ');


    return locs;

  }

  formatLabel(label: string): string {
    return label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
