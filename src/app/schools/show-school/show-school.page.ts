import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController, IonItemSliding, IonModal, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { Storage } from '@ionic/storage-angular';
import { Network, ConnectionStatus } from '@capacitor/network';
import { ApiService } from 'src/app/services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-show-school',
  templateUrl: './show-school.page.html',
  styleUrls: ['./show-school.page.scss'],
})
export class ShowSchoolPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  myKey: any = 'schools';

  school: any = null;
  classes: any = null;
  user: any = null;
  roles: any[] = [];

  latitude!: any;
  longitude!: any;
  address = '';

  schoolYears: any = null;

  className: string = '';
  nbr_fille: number = 0;
  nbr_garcon: number = 0;
  nbr_reboublant: number = 0;
  classeId: number = 0;

  loading: HTMLIonLoadingElement | null = null;
  networkStatus: ConnectionStatus;


  constructor(private navController: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private appStorage: Storage,

    private loadingCtrl: LoadingController,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchSchool();
    this.fectSchoolYear();
    this.fetchUser().then(() => {
      this.fetchRoles();
    });
  }

  cancel() {
    this.modal.dismiss(null, 'Annuler');
  }

  confirm() {
    this.modal.dismiss(this.className, 'Enregistrer');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'Enregistrer') {
      this.presentLoading('Enregistrement en cours...');
      let classes = [];
      this.appStorage.get('classes').then((data) => {
        if (data) {
          classes = data;
        } else {
          classes = [];
        }

        classes.push({
          id: this.generateId(),
          name: ev.detail.data,
          nbr_fille: this.nbr_fille,
          nbr_garcon: this.nbr_garcon,
          nbr_reboulant: this.nbr_reboublant,
          school_id: Number(this.route.snapshot.params['id']),
          schoolYear_id: 1,
          created_by: this.user.id
        });

        Network.getStatus().then(async status => {
          this.networkStatus = status;
          if (this.networkStatus.connected) {
            this.saveClasseToAPI();
          } 
        });


        this.appStorage.set('classes', classes).then(() => {
          this.fetchClassesBySchool();
          this.dismissLoading();
        });

      });




    }
  }

  async fetchUser() {
    const user: any = await this.appStorage.get('user');
    this.user = user;
  }

  fetchRoles() {
    this.appStorage.get('roles').then((roles) => {
      if (roles) {
        this.roles = roles;
      }
    });
  }

  async fectSchoolYear() {
    let schoolYears = await this.appStorage.get('schoolYears');

    this.schoolYears = schoolYears;
  }

  deleteClasse(item: any) {
    this.classes = this.classes.filter((classs: any) => classs.id !== item.id);

    this.appStorage.set('classes', this.classes);
  }

  editClasses(item: IonItemSliding, classe: any) {

  }

  async saveClasseToAPI() {
    
    let data = {
      name: this.className,
      nbr_fille: this.nbr_fille,
      nbr_garcon: this.nbr_garcon,
      nbr_reboulant: this.nbr_reboublant,
      school_id: this.school.id,
      schoolYear_id: this.getLastSchoolYearId(),
      created_by: this.user.id,
    };

    const classPromise = this.apiService.postClass(data.school_id, data);
    const classObservable = await classPromise;
    const cls = await lastValueFrom(classObservable).then((data: any) => {
      
    });
    

  }

  getLastSchoolYearId() {
    // schoolYear example: {id: 1, name: '2021-2022', start_date: '2021-09-01', end_date: '2022-06-30'}
    let schooYear = this.schoolYears.find((sch: any) => {
      if (sch && sch.end_date > new Date().toISOString()) {
        return sch.id;
      } else {
        return 0;
      }
    });

    return schooYear.id;
  }

  async fetchSchool() {
    const result = await this.appStorage.get(this.myKey);
    if (result) {
      this.school = result.find((sch: any) => sch.id == this.route.snapshot.params['id']);


      this.fetchClassesBySchool();

    }
  }

  async fetchClassesBySchool() {
    const result = await this.appStorage.get('classes');
    if (result) {
      this.classes = result.filter((classs: any) => classs.school_id == this.school.id);
    }



  }

  async resolve(id: number) {
    await this.navController.navigateForward('/tabs/complaint/' + id + '/resolve');
  }

  async deleteModal(item: any) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Supprimer',
          handler: async () => {
            const result = await this.appStorage.get('schools');

            let school = result.find((sch: any) => sch.id == item.id);
            if (school) {
              result.splice(result.indexOf(school), 1);

              school.status = "deleted"

              result.push(school);

              this.appStorage.set('schools', result);

              this.back();
            }


          },
        },
      ],
    });
    await alert.present();
  }


  generateId() {
    //returner un très très grand nombre
    this.classeId = Math.floor(Math.random() * 1000000000000000000);
    this.appStorage.get('classes').then((result) => {
      if (result) {
        let school = result.find((sch: any) => sch.id == this.classeId);
        if (school) {
          this.generateId();
        }
      }
    });

    return this.classeId;
  }





  back() {
    this.navController.navigateBack('tabs/schools');
  }

  showClasse(item: any) {
    this.navController.navigateForward('/tabs/schools/classe/' + item.id + '/view');
  }

  open(item: any) {


  }

  async edit(school: any) {
    await this.navController.navigateForward('/tabs/schools/' + school.id + '/edit');
  }

  async presentLoading(msg: string) {
    this.loading = await this.loadingCtrl.create({
      message: msg,
      duration: 5000,
    });

    this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

}
