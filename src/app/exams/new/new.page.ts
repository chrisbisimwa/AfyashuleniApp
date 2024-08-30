import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.page.html',
  styleUrls: ['./new.page.scss'],
})
export class NewPage implements OnInit {

  selectedYear: any;
  selectedSchool: any;
  selectedClasse: any;
  selectedStudent: any;
  isReadyToSave: boolean = false; isResolved: boolean = false;
  schoolYears: any[] = [];
  schools: any[] = [];
  classes: any[] = [];
  students: any[] = [];
  selectedExamType: string = '';
  examTypes: string[] = []; 
  completedExamTypes: string[] = []; 
  answers: { [key: string]: any } = {};
  questions: { [key: string]: any[] | null } = {};
  form: FormGroup;

  questionsMedecin: Exam = {
    "anamnes_biometrique": [
      { label: "Aspect de l'urine", options: null },
      { label: "Leucocytes", options: ['Négatif', 'Trace', '1+', '2+', '3+'] },
    ],
    // ...
    "clinique": [
      {label:"aspect_general", options:['Bon', 'Altéré']},  // Champ avec valeurs prédéfinies
      {label:"dysmorphie", options:['Malformation de la gorge', 'Malformation de la bouche', 'Malformation du nez', 'Autres']},
      // ... autres propriétés
    ],
  };
 /*  questionsMedecin: Questions = {
    "anamnes_biometrique": {
      "aspect_urine": null,  // Champ texte libre
      "Leucocytes": ['Négatif', 'Trace', '1+', '2+', '3+'],  // Champ avec valeurs prédéfinies
      // ... autres propriétés
    },
    "clinique": {
      "aspect_general": ['Bon', 'Altéré'],  // Champ avec valeurs prédéfinies
      "dysmorphie": ['Malformation de la gorge', 'Malformation de la bouche', 'Malformation du nez', 'Autres'],
      // ... autres propriétés
    },
    // ... autres catégories
  }; */
 
  constructor(protected fb: FormBuilder, public platform: Platform, private dataService: DataService, private navController: NavController,
    private toastCtrl: ToastController) {
    this.fetchSchoolYears();

    this.form = this.fb.group({
      answers: this.fb.group({}) // Dynamically add controls based on selected exam type
    });


  }

  ngOnInit() {
    this.fetchSchoolYears();

    this.examTypes = Object.keys(this.questionsMedecin);

    
  }

  initializeAnswers() {
    for (let examType in this.questionsMedecin) {
      this.answers[examType] = {};
    }
  }

  save() {




  }

  

  async fetchSchoolYears() {
    //fetch school years from local storage
    const schoolYears = await this.dataService.get('schoolYears');
    this.schoolYears = schoolYears.data || [];
  }

  async fetchSchools(event: any) {
    console.log(event.target.value);
    //fetch schools from local storage based on selected school year
    const schools = await this.dataService.get('schools');
    let ch = schools.data || [];

    const cls = await this.dataService.get('classes');
    let cl = cls || [];


    let clas = [];
    for (const c of cl) {
      if (c.schoolYear_id == event.target.value) {
        clas.push(c);
      }
    }

    this.schools = [];
    for (const s of ch) {
      for (const c of clas) {
        if (s.id == c.school_id) {
          if (this.schools.indexOf(s) === -1) {
            this.schools.push(s);
          }


        }
      }
    }


  }

  async fetchClasses(event: any) {
    const cls = await this.dataService.get('classes');
    let cl = cls || [];

    for (const c of cl) {
      if (c.school_id == event.target.value) {
        this.classes.push(c);
      }
    }
  }

  readyForNexStep(event: any) {
    if (event.target.value) {
      this.isReadyToSave = true;
    }
  }

  async loadQuestions(event: any) {
    this.initializeAnswers();
    
    console.log('Selected Exam Type:', event.target.value);
    console.log('Questions:', this.questionsMedecin[event.target.value]); // Vérifiez si la clé existe

  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  formatLabel(label: string): string {
    return label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  async fetchStudents(event: any) {
    const cls = await this.dataService.get('student-history');
    let cl = cls || [];

    let hist = [];
    for (const c of cl) {
      if (c.class_id == event.target.value && c.schoolYear_id == this.selectedYear) {
        hist.push(c);
      }
    }


    const allStudents = await this.dataService.get('students');
    let allStu = allStudents.data || [];
    for (const st of allStu) {
      if (st.current_class_id == event.target.value) {
        this.students.push(st);
      }
    }
  }


   ucfirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}


interface Question {
  label: string;
  options?: string[] | null;
}

interface Exam {
  [key: string]: Question[];
}
