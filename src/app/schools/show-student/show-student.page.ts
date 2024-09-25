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

  constructor(
    private navController: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private appStorage: Storage
  ) { }

  ngOnInit() {
    this.fetchStudent();
    this.fectClasse().then(() => {
      this.fetchSchool();
    });

  }

  async fetchStudent() {
    const id = this.route.snapshot.params['id'];
    const students = await this.appStorage.get('students');
    const student = students.find((item: { id: any; }) => item.id == id);
    this.student = student;
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

  deleteModal() {
    const alert = this.alertController.create({
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
              this.navController.navigateBack('/students');
            }
          }
        }
      ]
    });
  }

}
