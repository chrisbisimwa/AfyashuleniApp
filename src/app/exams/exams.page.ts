import { Component } from '@angular/core';
import { IonItemSliding, NavController, Platform, ToastController, AlertController } from '@ionic/angular';
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
    private datePipe: DatePipe,
    private alertCtrl: AlertController

  ) {
    this.fetchUser().then(() => {
      this.fetchExams(null, this.user);
    });

  }

  ionViewWillEnter() {
    this.reload(null);
  }

  async fetchUser() {
    this.user = await this.appStrorage.get('user');
    this.users = await this.appStrorage.get('users');
  }

  reload(refresher: any) {
    this.fetchUser().then(() => {
      if (this.user) {
        this.fetchExams(refresher, this.user);
      }


    });

    if (refresher) {
      refresher.target.complete();
    }
  }


  async fetchExams(refresher?: any, user?: any) {
    if (!user) {
      user = this.user
    }
    const exams = await this.appStrorage.get('exams');
    const exs = [];
    if (exams) {
      for (let exam of exams) {
        if (this.getExaminerGroupIdByExaminerId(exam.examiner_id) === user.group_id && exam.status !== "deleted") {
          exam.studentName = await this.getstudentNameById(exam.student_id);
          exam.examinerName = await this.getExaminerNameById(exam.examiner_id);
          exam.doctor = await this.getExaminerNameById(exam.doctor_id);
          exam.hasDoctor = await this.hasDoctor(exam);
          exam.problems = await this.loadExamProblems(exam);
          exs.push(exam);
        }
      }

    }

    //trier les examens par date
    exs.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    this.exams = exs;


    if (refresher) {
      refresher.target.complete();
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

    let examiner = null;
    if (this.users) {
      examiner = this.users.find((item: any) => item.id === id);
    }

    if (examiner) {
      return examiner.group_id;
    } else {
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

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'LOW':
        return 'success'; // Vert
      case 'MEDIUM':
        return 'warning'; // Orange
      case 'HIGH':
        return 'danger'; // Rouge
      default:
        return 'medium'; // Gris par défaut
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
    //console.log('examId', examId);
    await this.navController.navigateForward('/tabs/exams/' + examId + '/view');

  }
  async edit(item: IonItemSliding, site: any) {
    await this.navController.navigateForward('/tabs/entities/customer/' + site.id + '/edit');
    await item.close();
  }

  async delete(examId: any) {
    this.alertCtrl.create({
      header: 'Confirmation de suppression',
      message: 'Est vous sûr de vouloir supprimer cet examen?',
      buttons: [
        {
          text: 'Oui',
          handler: () => {
            this.deleteExam(examId);
          }
        },
        {
          text: 'Non',
          handler: () => { }
        }
      ]
    }).then(alert => alert.present());

    /*  this.customerService.delete(customer.id).subscribe(
       async () => {
         const toast = await this.toastCtrl.create({ message: 'Customer deleted successfully.', duration: 3000, position: 'middle' });
         await toast.present();
         await this.loadAll();
       },
       error => console.error(error)
     ); */
  }

  deleteExam(examId: any) {
    this.appStrorage.get('exams').then((exams) => {
      let exam = exams.filter((item: any) => item.id == examId)[0];


      exams.splice(exams.indexOf(exam), 1);

      exams.push({
        id: exam.id,
        code: exam.code,
        student_id: exam.student_id,
        examiner_id: exam.examiner_id,
        date: exam.date,
        latitude: exam.latitude,
        longitude: exam.longitude,
        data: exam.data,
        status: "deleted",
        created_at: exam.created_at,
        updated_at: exam.updated_at
      });


      this.appStrorage.set('exams', exams).then(() => {
        this.fetchExams(null);
      });

    });
  }

  hasExamenClinique(exam: any) {
    if (exam && exam.data) {

      let data = JSON.parse(exam.data);
      console.log('Exam data:', data);
      if (data.examen_clinique && Object.keys(data.examen_clinique).length > 0) {
        return Object.values(data.examen_clinique).some(value =>
          value !== "" && value !== null && value !== undefined
        );
      }

      console.log('No examen clinique data found for exam:', exam.id);
      return false;
    }

    return false;
  }

  hasDoctor(exam: any) {
    if (exam && exam.doctor_id && exam.doctor_id !== 0) {
      return true;
    }

    return false;
  }

  async loadExamProblems(exam: any) {
    // Vérifie si 'exam' et 'exam.id' existent pour éviter les erreurs
    if (!exam || !exam.id) {
      console.error('Exam or Exam ID is undefined');
      return []; // Retourne un tableau vide si l'examen n'est pas valide
    }

    try {
      const evaluations = await this.appStrorage.get('evaluations');

      if (evaluations && Array.isArray(evaluations)) {
        const problems = evaluations.filter((item: any) => item.examination_id === exam.id);
        return problems;
      } else {
        console.log('No evaluations found or evaluations is not an array for exam:', exam.id);
        return []; // Retourne un tableau vide si pas d'évaluations
      }
    } catch (error) {
      console.error('Error loading problems for exam:', exam.id, error);
      return []; // Retourne un tableau vide en cas d'erreur
    }
  }

  coutProblems(exam: any) {
    let count = 0;

  }




}
