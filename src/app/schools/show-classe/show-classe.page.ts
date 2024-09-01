import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonModal, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-show-classe',
  templateUrl: './show-classe.page.html',
  styleUrls: ['./show-classe.page.scss'],
})
export class ShowClassePage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  classe: any = null;
  students: any = null;
  shcoolName: any= null;

  name!: any;

  schoolYears: any = null;
 
  studentName: string='';


  constructor(private navController: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private dataService: DataService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.fetchClasse();
    /* this.fectSchoolYear(); */

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
      this.dataService.get('students').then((data)=>{
        let classes = data;
     
        classes.push({name: ev.detail.data, school_id: Number(this.route.snapshot.params['id']), schoolYear_id: null});
  
        data=classes;
  
        this.dataService.set('students', data);
      })
    }
  }

  /* async fectSchoolYear() {  
    let schoolYears = await this.dataService.get('schoolYears');
    
    this.schoolYears = schoolYears.data;
  } */

   /* getLastSchoolYearId() {
    // schoolYear example: {id: 1, name: '2021-2022', start_date: '2021-09-01', end_date: '2022-06-30'}
    let schooYear = this.schoolYears.find((sch: any) => {
      if (sch && sch.end_date > new Date().toISOString()) {
        return sch.id;
      }else{
        return 0;
      }
    });

    return schooYear.id;
  }
 */
  async fetchClasse() {
    this.dataService.get('classes').then((data) => {
      let classes = data;
      this.classe = classes.find((classe: any) => classe.id == this.route.snapshot.params['id']);
       this.dataService.get('schools').then((data) => {
        let schools = data.data;
        this.shcoolName = schools.find((school: any) => school.id == this.classe.school_id);
        this.shcoolName = this.shcoolName.name;
      });

      this.fetchStudentsByClasse();
    })
  }

  async fetchStudentsByClasse() {
    this.dataService.get('students').then((data) => {
      
      if (data && data.data.length > 0 ) {
        
        let students = data.data
        this.students = students.filter((student: any) => student.current_class_id == this.route.snapshot.params['id']);
        
      }

    })
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
          handler: () => {
            console.log(item.id);
            /*  this.service.delete(item.id).then(async ()=>{
               await this.navController.navigateForward('/tabs/complaint');
             }) */

          },
        },
      ],
    });
    await alert.present();
  }








  back() {
    this.navController.navigateBack('tabs/complaint');
  }

  showStudent(item: any) {
    this.navController.navigateForward('/schools/classe/student/'+ item.id+'/view');
  }

  open(item:any){

    
  }

}
