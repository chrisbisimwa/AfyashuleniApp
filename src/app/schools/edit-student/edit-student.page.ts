import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonModal, NavController, Platform } from '@ionic/angular';
@Component({
  selector: 'app-edit-student',
  templateUrl: './edit-student.page.html',
  styleUrls: ['./edit-student.page.scss'],
})
export class EditStudentPage implements OnInit {
  isReadyToSave: boolean = false;
  student: any = null;
  studentId: number = 0;
  code: string = '';
  created_at: string = '';
  updated_at: string = ''
  current_class_id: number = 0;
  date_of_birth: string = '';
  first_name: string = '';
  gender: string = '';
  last_name: string = '';
  photo: string = '';
  placeInClasse: number = 0;
  place_of_birth: string = '';
  surname: string = '';

  constructor(
    private appStorage: Storage,
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController,
    private alertController: AlertController,
    public platform: Platform,

  ) { }

  async ngOnInit() {
    await this.fetchStudent();
  }

  async fetchStudent() {
    const id = this.route.snapshot.params['id'];
    const students = await this.appStorage.get('students') || [];
    this.student = students.find((item: { id: any; status?: string; }) => item.id == id && item.status != 'deleted');
    if (this.student) {
      this.studentId = this.student.id;
      this.code = this.student.code;
      this.created_at = this.student.created_at;
      this.updated_at = this.student.updated_at;
      this.current_class_id = this.student.current_class_id;
      this.date_of_birth = this.student.date_of_birth;
      this.first_name = this.student.first_name;
      this.gender = this.student.gender;
      this.last_name = this.student.last_name;
      this.photo = this.student.photo;
      this.placeInClasse = this.student.placeInClasse;
      this.place_of_birth = this.student.place_of_birth;
      this.surname = this.student.surname;
    }
  }

  async save() {
    const students = await this.appStorage.get('students');
    const student = students.find((item: { id: any; }) => item.id == this.studentId);
    if (student) {
      students.splice(students.indexOf(student), 1);
      let std: any = {};
      if (student.created_at) {
        std.status = 'updated';
      }
      std.id = this.studentId;
      std.code = this.code;
      std.created_at = this.created_at;
      std.updated_at = this.updated_at;
      std.current_class_id = this.current_class_id;
      std.date_of_birth = this.date_of_birth;
      std.first_name = this.first_name;
      std.gender = this.gender;
      std.last_name = this.last_name;
      std.photo = this.photo;
      std.placeInClasse = this.placeInClasse;
      std.place_of_birth = this.place_of_birth;
      std.surname = this.surname;


      await students.push(std);
      await this.appStorage.set('students', students);

    }

     this.router.navigate(['/tabs/schools/classe/student/' + this.studentId + '/view'])

  }

  previousState() {
    this.navController.navigateForward('/tabs/schools/classe/' + this.student.current_class_id + '/view');
  }

}
