import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonModal, NavController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-show-classe',
  templateUrl: './show-classe.page.html',
  styleUrls: ['./show-classe.page.scss'],
})
export class ShowClassePage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  classe: any = null;
  students: any = null;
  shcoolName: any = null;

  name!: any;

  schoolYears: any = null;

  studentName: string = '';
  studentPostName: string = '';
  studentSurname: string = '';
  gender: string = '';
  birthDate: string = '';
  birthPlace: string = '';
  studentCode: string = '';
  studentId: number = 0;


  constructor(
    private navController: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private appStorage: Storage
  ) { }

  ngOnInit() {
    this.fetchClasse();
    this.fectSchoolYear();
    this.studentCode = this.generateStudentCode();
    this.saveSchoolYear();

  }

  cancel() {
    this.modal.dismiss(null, 'Annuler');
  }

  confirm() {
    this.modal.dismiss(this.studentName, 'Enregistrer');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'Enregistrer') {
      let students = [];
      this.appStorage.get('students').then((data) => {
        if (data) {
          students = data;
        } else {
          students = [];
        }

        students.push(
          {
            id: this.generateId(),
            first_name: this.studentName,
            last_name: this.studentPostName,
            surname: this.studentSurname,
            gender: this.gender,
            date_of_birth: this.birthDate,
            place_of_birth: this.birthPlace,
            current_class_id: this.route.snapshot.params['id'],
          }
        );


        this.appStorage.set('students', students).then(() => {
          this.fetchStudentsByClasse();
          });



        let studentHistory = [];
        this.appStorage.get('student-history').then((data) => {
          if (data) {
            studentHistory = data;
          } else {
            studentHistory = [];
          }
          studentHistory.push({
            student_id: this.studentId,
            school_year_id: 1,
            classe_id: this.route.snapshot.params['id']
          });
          this.appStorage.set('student-history', studentHistory);
        }
        );



      })
    }
  }

  async fectSchoolYear() {
    let schoolYears = await this.appStorage.get('schoolYears');
    if(schoolYears){
      this.schoolYears = schoolYears;
    }

    
  }

  saveSchoolYear() {
    let schoolYears = [];
    this.appStorage.get('schoolYears').then((data) => {

      schoolYears = [];


      schoolYears.push({ id: 1, year: '2024-2025', start_date: '2024-09-01', end_date: '2025-06-30' });

      this.appStorage.set('schoolYears', schoolYears);
    });
  }

  async getLastSchoolYearId() {
    let schoolYears = await this.appStorage.get('schoolYears');
    if (schoolYears) {
      let schoolYear = schoolYears.find((schoolYear: any) => schoolYear.year == "2024-2025");
      if (schoolYear) {
        return schoolYear.id;
      }

    }

    return 0;

  }


  generateStudentCode() {
    let code = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return code;
  }

  async fetchClasse() {
    const result = await this.appStorage.get('classes');

    if (result) {
      this.classe = result.find((classe: any) => classe.id == this.route.snapshot.params['id']);
      this.shcoolName = this.getSchoolName(this.classe.school_id);
      this.fetchStudentsByClasse();
    }
  }

  async getSchoolName(schoolId:any) {
    const result = await this.appStorage.get('schools');
    if (result) {
      const school = result.find((school: any) => school.id == schoolId);
      

      if(school){
        this.shcoolName = school.name;
      }else{
        this.shcoolName = "Ecole non trouvée";
      }
      
    }

    

    return this.shcoolName;
  }

  async fetchStudentsByClasse() {
    const result = await this.appStorage.get('students');
    if (result) {
      this.students = result.filter((student: any) => student.current_class_id == this.route.snapshot.params['id'] && student.status != 'deleted');
    }
  }

  async resolve(id: number) {
    await this.navController.navigateForward('/tabs/complaint/' + id + '/resolve');
  }

  async deleteModal(item: any) {
    const alert = await this.alertController.create({
      header: 'Confirm the deletion?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          handler: async () => {
            const result = await this.appStorage.get('classes');
            
            let classe = result.find((sch: any) => sch.id == item.id);
            if(classe){
              result.splice(result.indexOf(classe), 1);

              classe.status="deleted"

              result.push(classe);

              this.appStorage.set('classes', result);
            }

          },
        },
      ],
    });
    await alert.present();
  }



  generateId() {
    //returner un très très grand nombre
    this.studentId = Math.floor(Math.random() * 1000000000000000000);
    this.appStorage.get('students').then((result) => {
      if (result) {
        let student = result.find((sch: any) => sch.id == this.studentId);
        if (student) {
          this.generateId();
        }
      }
    });
    return this.studentId;
  }





  back() {
    this.navController.navigateBack('tabs/complaint');
  }

  showStudent(item: any) {
    this.navController.navigateForward('/tabs/schools/classe/student/' + item.id + '/view');
  }

  edit(item: any) {

    this.navController.navigateForward('/tabs/schools/classe/' + item.id + '/edit');
  }

}
