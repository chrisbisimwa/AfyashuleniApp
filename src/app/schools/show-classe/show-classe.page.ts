import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  user: any = null;
  roles: any[] = [];

  name!: any;

  schoolYears: any = null;

  studentName: string = '';
  studentPostName: string = '';
  studentSurname: string = '';
  gender: string = '';
  birthDate: string = '';
  birthPlace: string = '';
  studentCode: string = '';
  placeInClasse: string = '';
  studentId: number = 0;


  constructor(
    private navController: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private appStorage: Storage
  ) { }

  async ngOnInit() {
    await this.fetchUser(); 
    await this.fetchClasse();
    await this.fectSchoolYear();
    this.studentCode = await this.generateStudentCode();

  }

  async ionViewWillEnter(){
    await this.fetchUser(); 
    await this.fetchClasse();
    await this.fectSchoolYear();
    this.studentCode = await this.generateStudentCode();
  }

  cancel() {
    this.modal.dismiss(null, 'Annuler');
  }

  confirm() {
    this.modal.dismiss(this.studentName, 'Enregistrer');
  }

  async fetchUser() {
    this.user = await this.appStorage.get('user');
    this.roles = await this.appStorage.get('roles');
  }

  async onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role !== 'Enregistrer') {
      return; // On sort si l'utilisateur n'a pas confirmé
    }

    try {
      // 1. Générer un nouvel ID pour l'élève
      const newStudentId = await this.generateId();

      // 2. Préparer le nouvel objet élève
      const newStudent = {
        id: newStudentId,
        first_name: this.studentName,
        last_name: this.studentPostName,
        surname: this.studentSurname,
        gender: this.gender,
        date_of_birth: this.birthDate,
        place_of_birth: this.birthPlace,
        current_class_id: Number(this.route.snapshot.params['id']),
        status: 'active' // C'est une bonne pratique d'ajouter un statut
      };

      // 3. Mettre à jour la liste des élèves
      const students = await this.appStorage.get('students') || [];
      students.push(newStudent);
      await this.appStorage.set('students', students);

      // 4. Mettre à jour l'historique de l'élève
      const studentHistory = await this.appStorage.get('student-history') || [];
      studentHistory.push({
        student_id: newStudentId,
        school_year_id: 1, // Idéalement, cet ID devrait être dynamique
        classe_id: Number(this.route.snapshot.params['id'])
      });
      await this.appStorage.set('student-history', studentHistory);

      // 5. Rafraîchir la liste affichée à l'écran
      await this.fetchStudentsByClasse();

      // 6. Vider les champs du formulaire pour la prochaine fois
      this.studentName = '';
      this.studentPostName = '';
      this.studentSurname = '';
      this.gender = '';
      this.birthDate = '';
      this.birthPlace = '';
      this.studentCode = '';
      this.placeInClasse = '';
      this.studentId = 0;

    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'élève :", error);
      // Optionnel : Afficher une alerte à l'utilisateur
    }
  }

  async fectSchoolYear() {
    let schoolYears = await this.appStorage.get('schoolYears');
    if (schoolYears) {
      this.schoolYears = schoolYears;
    }


  }



  async getLastSchoolYearId() {
    let schoolYears = await this.appStorage.get('schoolYears');
    if (schoolYears) {
      let schoolYear = schoolYears.find((schoolYear: any) => schoolYear.active == true);
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

  async getSchoolName(schoolId: any) {
    const result = await this.appStorage.get('schools');
    if (result) {
      const school = result.find((school: any) => school.id == schoolId);


      if (school) {
        this.shcoolName = school.name;
      } else {
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
            if (classe) {
              result.splice(result.indexOf(classe), 1);

              classe.status = "deleted"

              result.push(classe);

              this.appStorage.set('classes', result);
            }

          },
        },
      ],
    });
    await alert.present();
  }





  async generateId(): Promise<number> {
    // Générer un ID basé sur le timestamp + une partie aléatoire
    const timestamp = Date.now(); // Timestamp en millisecondes (unique à chaque milliseconde)
    const randomPart = Math.floor(Math.random() * 10000); // Partie aléatoire (0 à 9999)
    this.studentId = Number(`${timestamp}${randomPart}${this.user.id}`); // Concaténer et convertir en nombre

    // Vérifier si l'ID existe déjà dans le stockage
    const result = await this.appStorage.get('students');
    if (result) {
      const school = result.find((sdt: any) => sdt.id === this.studentId);
      if (school) {
        // Si l'ID existe déjà, générer un nouvel ID
        return await this.generateId(); // Récursion jusqu'à obtenir un ID unique
      }
    }

    return this.studentId; // Retourner l'ID unique
  }





  previousState() {
    this.router.navigate(['/tabs/schools/' + this.classe.school_id + '/view']);
  }

  showStudent(item: any) {
    this.navController.navigateForward('/tabs/schools/classe/student/' + item.id + '/view');
  }

  edit(item: any) {

    this.navController.navigateForward('/tabs/schools/classe/' + item.id + '/edit');
  }

  search(query: any, refresher?: any) {
    if (!query) {
      this.fetchStudentsByClasse();

    } else {
      let result: any[] = this.students.filter((item: any) =>
        Object.keys(item).some((k: string) => item[k] != null &&
          item[k].toString().toLowerCase()
            .includes(query.toLowerCase()))
      );
      this.students = result;
    }

  }



}
