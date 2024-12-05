import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-edit-classe',
  templateUrl: './edit-classe.page.html',
  styleUrls: ['./edit-classe.page.scss'],
})
export class EditClassePage implements OnInit {

  isReadyToSave: boolean = false;
  classe: any = null;
  classeId: number = 0;
  name: string = '';
  nbr_fille: number = 0;
  nbr_garcon: number = 0;
  nbr_reboulant: number = 0;
  schoolYear_id: number = 0;
  school_id: number = 0;
  created_at: string = '';
  updated_at: string = '';
  
  constructor(
    public platform: Platform,
    private appStorage: Storage,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.fetchClasse();
  }

  async save() {

    const classes = await this.appStorage.get('classes');
    const classe = classes.find((item: { id: any; }) => item.id == this.route.snapshot.params['id']);
    if (classe) {
      classes.splice(classes.indexOf(classe), 1);

      let cls: any = {};
      cls.status = 'updated';
      cls.id=this.classeId
      cls.name = this.name ?? "";
      cls.nbr_fille = this.nbr_fille;
      cls.nbr_garcon = this.nbr_garcon;
      cls.nbr_reboulant = this.nbr_reboulant;
      cls.school_id = this.school_id;
      cls.schoolYear_id= this.schoolYear_id;
      cls.created_at = this.created_at;
      cls.updated_at = this.updated_at;

      

      classes.push(cls);
      this.appStorage.set('classes', classes);
      this.router.navigate(['/tabs/schools/'+this.school_id+'/view'])
    }


    


  }
  async fetchClasse() {
    const result = await this.appStorage.get('classes');
    if (result) {
      this.classe = result.find((sch: any) => sch.id == this.route.snapshot.params['id']);

      if (this.classe) {
        this.classeId = this.classe.id;
        this.name = this.classe.name;
        this.nbr_fille = this.classe.nbr_fille;
        this.nbr_garcon = this.classe.nbr_garcon;
        this.nbr_reboulant = this.classe.nbr_reboulant;
        this.schoolYear_id = this.classe.schoolYear_id;
        this.school_id = this.classe.school_id;
        this.created_at = this.classe.created_at;
        this.updated_at = this.classe.updated_at;

      }


    }
  }


  goToClasses(id: number) {
    this.router.navigate(['/tabs/schools/' + id + '/view']);
  }


  previousState() {
    window.history.back();
  }

}
