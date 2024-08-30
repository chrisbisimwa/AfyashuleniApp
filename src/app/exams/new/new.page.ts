import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { AuthService } from 'src/app/services/auth.service';

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
  problems: any[] = [];
  evaluations: any[] = [];
  user: any;
  selectedExamType: string = '';
  examTypes: string[] = [];
  completedExamTypes: string[] = [];
  answers: { [key: string]: any } = {};
  groupedAnswers: { [key: string]: { [key: string]: any } } = {};
  questions: { [key: string]: any[] | null } = {};
  form: FormGroup;
  presentingElement: Element | null = null;
  studentGender: string = "";

  public $questionsInfirmier: Exam = {
    'situation_familiale': [
      { label: 'Parents en vie', options: ['Les deux', 'Mère seulement', 'Père seulement', 'Aucun'], gender: 'both' },
      { label: 'Elève vit avec', options: ['Les deux parents', 'La mère', 'Le père', 'Famille paternelle', 'Famille maternelle', 'Tuteur'], gender: 'both' },
      { label: 'Occupation des parents avec qui élève vit', options: null, gender: 'both' },
      { label: 'Nombre enfants fratrie', options: null, gender: 'both' },
      { label: 'Rand dans la fratrie', options: null, gender: 'both' },
      { label: 'Niveau revenu famillial', options: ['Bas', 'Moyen', 'Élevé'], gender: 'both' },
      { label: 'Type habitation', options: ['Etage', 'Semi-durable', 'Durable', 'Rai de chaussé avec humide', 'Rai de chaussé sans humide', 'Plance', 'Paille', 'Cave', 'Boue'], gender: 'both' },
      { label: 'Accès aux soins de santé', options: ['Oui', 'Non'], gender: 'both' },
    ],
    'calendrier_vaccinal': [
      { label: 'BCG (tuberculose)', options: ['Lisible', 'Non lisible', 'Douteux'], gender: 'both' },
      { label: 'VPO (poliomyélite)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'DTCoq-Hép-B-Hib', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'PCV-13 (pneumo)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'VAR (rougeole)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'VAA (fièvre jaune)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'DTCoq (diphtérie, tétanos, coqueluce)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
    ],
    'deparasitage': [
      { label: 'Deparasite', options: ['Oui', 'Non', 'Inconnu'], gender: 'both' },
      { label: 'Date du dernier déparasitage', options: null, gender: 'both' },
      { label: 'Médicament de déparasitage', options: ['Albendazole 100mg', 'Albendazole 500mg', 'Mebendazole 100mg', 'Mebendazole 500mg'], gender: 'both' },
      { label: 'Fréquence', options: ['1 mois', '2 mois', '3 mois', '4 mois', 'Plus de 4 mois'], gender: 'both' },
    ],
    'comportement_langage': [
      { label: 'Comportement', options: ['Calme', 'Agité', 'Distrait', 'Peureux', 'Curieux', 'Autres'], gender: 'both' },
      { label: 'Si autre comportement, préciser', options: null, gender: 'both' },
      { label: 'Langage', options: ['Bégaiement', 'Zozotement', 'Autres'], gender: 'both' },
      { label: 'Si autre language, préciser', options: null, gender: 'both' },
    ],
    'anamnes_biometrique': [
      { label: 'Nutrition', options: null, gender: 'both' },
      { label: 'Sommeil', options: null, gender: 'both' },
      { label: 'Exercice physique', options: null, gender: 'both' },
      { label: 'Hygiènne corporelle', options: null, gender: 'both' },
      { label: 'Hygiènne_vestimentaire', options: null, gender: 'both' },
      { label: 'Antecedents personnels', options: null, gender: 'both' },
      { label: 'Anamnese familial', options: null, gender: 'both' },
      { label: 'Allergies', options: null, gender: 'both' },
      { label: 'Traitements chroniques', options: null, gender: 'both' },
      { label: 'Place en classe', options: null, gender: 'both' },
      { label: 'Plaintes visuelles', options: null, gender: 'both' },
      { label: 'Plaintes auditives', options: null, gender: 'both' },
      { label: 'Taille (cm)', options: null, gender: 'both' },
      { label: 'poids (Kg)', options: null, gender: 'both' },
      { label: 'acuite_visuelle_loin_droite_sans_correction', options: ['1,00', '0,9', '0,8', '0,7', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1', '0,0'], gender: 'both' },
      { label: 'acuite_visuelle_loin_gauche_sans_correction', options: ['1,00', '0,9', '0,8', '0,7', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1', '0,0'], gender: 'both' },
      { label: 'acuite_loin_droite_avec_lunettes', options: ['1,00', '0,9', '0,8', '0,7', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1', '0,0'], gender: 'both' },
      { label: 'acuite_loin_gauche_avec_lunettes', options: ['1,00', '0,9', '0,8', '0,7', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1', '0,0'], gender: 'both' },
      { label: 'reflet_corneen', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'test_occlusion', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_droite', options: ['1000', '2000', '4000', '3000', '500'], gender: 'both' },
      { label: 'audiometrie_gauche', options: ['1000', '2000', '4000', '3000', '500'], gender: 'both' },
      { label: 'Test de la montre gauche ', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Test de la montre droite ', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Test du diapason gauche', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Test du diapason droite', options: ['Bon', 'Pas bon'], gender: 'both' },
    ],
  };

  questionsMedecin: Exam = {
    "anamnes_biometrique": [
      { label: "Aspect de l'urine", options: null, gender: 'both' },
      { label: "Leucocytes", options: ['Négatif', 'Trace', '1+', '2+', '3+'], gender: 'both' },
      { label: "Nitrites", options: ['Positif', 'Négatif'], gender: 'both' },
      { label: "Protéines", options: ['Négatif', 'Trace', '1+', '2+', '3+'], gender: 'both' },
      { label: "Glucose", options: ['Négatif', '1+', '2+', '3+', '4+'], gender: 'both' },
      { label: "Hémoglobine", options: ['Négatif', '1+', '2+', '3+'], gender: 'both' },
    ],
    // ...
    "clinique": [
      { label: "Anamnese", options: null, gender: 'both' },
      { label: "aspect_general", options: ['Bon', 'Altéré'], gender: 'both' },  // Champ avec valeurs prédéfinies
      { label: "dysmorphie", options: ['Malformation de la gorge', 'Malformation de la bouche', 'Malformation du nez', 'Malformation des oreilles', 'Malformation des yeux', 'Malformation des membres', 'Autres'], gender: 'both' },
      { label: "Si autre dysmorphie, préciser", options: null, gender: 'both' },
      { label: "Conjonctive", options: ['Coloré', 'Non coloré'], gender: 'both' },
      { label: "Brosse à dent", options: ['Oui', 'Non'], gender: 'both' },
      { label: "Dentiste", options: ['Oui', 'Non'], gender: 'both' },
      { label: "Carie", options: ['Oui', 'Non'], gender: 'both' },
      { label: "Si oui, stade carie", options: ['Stade 1', 'Stade 2', 'Stade 3', 'Stade 4', 'Stade 5'], gender: 'both' },
      { label: 'Plaque', options: ['-', '+', '2+', '3+', '+/-'], gender: 'both' },
      { label: 'Tartre', options: ['-', '+', '2+', '3+', '+/-'], gender: 'both' },
      { label: 'Débri alimentaire', options: ['-', '+', '2+', '3+', '+/-'], gender: 'both' },
      { label: 'Gingivite', options: ['Plus', 'Moins'], gender: 'both' },
      { label: 'gorge', options: ['Normale', 'Tuméfiée', 'Hyperhémique'], gender: 'both' },
      { label: 'nez', options: ['Rien à signaler', 'Corp étranger', 'Polype', 'Autres'], gender: 'both' },
      { label: 'Triangle limineux (oreille gauche)', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Triangle limineux (oreille droite)', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Bouchon de cérumen (oreille gauche)', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Bouchon de cérumen (oreille droite)', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Corps étranger (oreille gauche)', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Corps étranger (oreille droite)', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Autitte', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Autre problème ORL', options: null, gender: 'both' },
      { label: 'thyroide', options: ['normale', 'tuméfiée'], gender: 'both' },
      { label: 'ganglions_droite_gauche', options: null, gender: 'both' },
      { label: 'Coeur', options: ['Normal', 'Insouffle'], gender: 'both' },
      { label: 'Bâtement cardiaque', options: ['Rythme régulier', 'Rythme irrégulier'], gender: 'both' },
      { label: 'Fréquence cardiaque', options: ['10 bpm', '20 bpm', '30 bpm', '40 bpm', '50 bpm', '60 bpm', '70 bpm', '80 bpm', '90 bpm', '100 bpm', '110 bpm', '120 bpm', '130 bpm', '140 bpm', '150 bpm', '160 bpm', '170 bpm', '180 bpm', '190 bpm', '200 bpm'], gender: 'both' },
      { label: 'Systole', options: ['10 mmHg', '20 mmHg', '30 mmHg', '40 mmHg', '50 mmHg', '60 mmHg', '70 mmHg', '80 mmHg', '90 mmHg', '100 mmHg', '110 mmHg', '120 mmHg', '130 mmHg', '140 mmHg', '150 mmHg', '160 mmHg', '170 mmHg', '180 mmHg', '190 mmHg', '200 mmHg'], gender: 'both' },
      { label: 'Diastole', options: ['10 mmHg', '20 mmHg', '30 mmHg', '40 mmHg', '50 mmHg', '60 mmHg', '70 mmHg', '80 mmHg', '90 mmHg', '100 mmHg', '110 mmHg', '120 mmHg', '130 mmHg', '140 mmHg', '150 mmHg', '160 mmHg', '170 mmHg', '180 mmHg', '190 mmHg', '200 mmHg'], gender: 'both' },
      { label: 'poumons', options: ['MVP', 'Sibulence tier supérieur gauche', 'Sibulence tier supérieur droit', 'Sibulence tier inférieur gauche', 'Sibulence tier inférieur droit', 'Sibulence tier moyen gauche', 'Sibulence tier moyen droit', 'Râles tier supérieur gauche', 'Râles tier supérieur droit', 'Râles tier inférieur gauche', 'Râles tier inférieur droit', 'Râles tier moyen gauche', 'Râles tier moyen droit', 'Autres'], gender: 'both' },
      { label: 'si autre problème de poumons, préciser', options: null, gender: 'both' },
      { label: 'Peau', options: ['Saine', 'Mycose', 'Gale', 'Plaie', 'Allergie', 'Autres'], gender: 'both' },
      { label: 'Si autre problème de peau, préciser', options: null, gender: 'both' },
      { label: 'Cheveux', options: ['Rien à signaler', 'Teigne tondante', 'Plaie', 'Autres'], gender: 'both' },
      { label: 'Si autre problème de cheveux, préciser', options: null, gender: 'both' },
      { label: 'ongles', options: ['Rien à signaler', 'Pied athlète', 'Mycose', 'Onycho-mycose', 'Autres'], gender: 'both' },
      { label: 'Hernie', options: ['Absente', 'Présente'], gender: 'both' },
      { label: 'Si hernie, préciser', options: null, gender: 'both' },
      { label: 'region_inguinale', options: ['Souple', 'Ballonée', 'Autres'], gender: 'both' },
      { label: 'Si autre problème de région inguinale, préciser', options: null, gender: 'both' },
      { label: 'Menarche', options: ['Oui', 'Non'], gender: 'female' },
      { label: 'Si oui, âge de la menarche', options: null, gender: 'female' },
      { label: 'Si non, averti ?', options: ['Oui', 'Non'], gender: 'female' },
      { label: 'Volume testicule droite', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'], gender: 'male' },
      { label: 'Volule testicule gauche', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'], gender: 'male' },

      { label: 'Pilosité pubienne', options: ['P1', 'P2', 'P3', 'P4', 'P5'], gender: 'both' },
      { label: 'Développement des organes génitaux', options: ['G1', 'G2', 'G3', 'G4', 'G5'], gender: 'male' },
      { label: 'Développement mammaire', options: ['S1', 'S2', 'S3', 'S4', 'S5'], gender: 'female' },
      { label: 'appareil_locomoteur_statique_colonne', options: ['OK', 'Malformation', 'Autres'], gender: 'both' },
      { label: 'appareil_locomoteur_statique_bassin', options: ['OK', 'Malformation', 'Autres'], gender: 'both' },
      { label: 'Membre_inferieur', options: ['OK', 'Malformation', 'Autres'], gender: 'both' },
      { label: 'Demarche', options: ['Bonne', 'Boiteuse', 'Autres'], gender: 'both' },
      { label: 'Equilibre', options: ['Bon', 'Aucun'], gender: 'both' },
      { label: 'fine_motricite', options: ['OK', 'Non'], gender: 'both' },
      { label: 'coordination', options: ['OK', 'Non'], gender: 'both' },
      { label: 'reflexe', options: ['OK', 'Non'], gender: 'both' },
      { label: 'Points attention_conseils', options: null, gender: 'both' },
      { label: 'Autres problèmes', options: null, gender: 'both' },
      // ... autres propriétés
    ],
  };


  constructor(protected fb: FormBuilder, public platform: Platform, private dataService: DataService, private authService: AuthService, private navController: NavController,
    private toastCtrl: ToastController) {
    this.fetchSchoolYears();
    this.fetchProblems();
    this.form = this.fb.group({
      answers: this.fb.group({}) // Dynamically add controls based on selected exam type
    });


  }

  ngOnInit() {
    this.fetchSchoolYears();

    this.examTypes = Object.keys(this.questionsMedecin);
    this.presentingElement = document.querySelector('.ion-page');

    this.fetchUser();




  }

  initializeAnswers() {
    for (let examType in this.questionsMedecin) {
      this.answers[examType] = {};
    }
  }

  async fetchUser() {
    this.user = await this.dataService.get('user') || {};
    return this.user;
  }

  save() {

    this.examTypes.forEach(type => {
      this.groupedAnswers[type] = {};  // Initialiser un objet pour chaque type d'examen

      this.questionsMedecin[type].forEach(question => {
        const questionLabel = question.label;

        if (this.answers[questionLabel] !== undefined) {
          this.groupedAnswers[type][questionLabel] = this.answers[questionLabel];
        }
      });
    });


    this.evaluateAnswers();

  }


  evaluateAnswers(): void {
    let evaluations = [];
    for (const question in this.answers) {

      const reponse = this.answers[question];


      // Vérifier si le déparasitage a été fait et si la date du dernier déparasitage est inférieure à 4 mois
      if (question === 'Deparasite' && reponse === 'Oui') {
        const dateStr = this.answers['Date du dernier déparasitage'];
        const date = new Date(dateStr).getTime();
        const now = Date.now();
        const diffMonths = (now - date) / (1000 * 60 * 60 * 24 * 30);

        if (diffMonths > 4) {
          evaluations.push({
            problem_id: this.getProblemIdByName('Déparasitage préventif insuffisant/inexistant'),
            problem_name: 'Déparasitage préventif insuffisant/inexistant',
            evaluation: 'to_follow',
          });
        }
      }

      // Vérifier le calendrier vaccinal
      if (question === 'BCG (tuberculose)' && reponse === 'Non lisible') {
        evaluations.push({
          problem_id: this.getProblemIdByName('Cicatrice BCG non lisible'),
          problem_name: 'Cicatrice BCG non lisible',
          evaluation: 'to_follow',
        });
      }

      // Évaluer les problèmes d'acuité visuelle (inférieur à 0.8)
      if (
        (question === 'acuite_visuelle_loin_droite_sans_correction' || question === 'acuite_visuelle_loin_gauche_sans_correction') &&
        parseFloat(reponse) < 0.8) {
        evaluations.push({
          problem_id: this.getProblemIdByName('Problème d\'acuité visuelle'),
          problem_name: 'Problème d\'acuité visuelle',
          evaluation: 'to_follow',
        });
      }

      // Évaluer les problèmes d'acuité auditive
      if (
        (question === 'audiometrie_droite' || reponse === 'audiometrie_gauche') &&
        parseFloat(reponse) < 20) {
        evaluations.push({
          problem_id: this.getProblemIdByName('Problème d\'acuité auditive'),
          problem_name: 'Problème d\'acuité auditive',
          evaluation: 'to_follow',
        });
      }

      // Évaluer les problèmes dentaires mineurs
      if (question === 'Carie' && reponse === 'Oui' &&
        this.answers['Si oui, stade carie'] === 'Stade 1') {
        evaluations.push({
          problem_id: this.getProblemIdByName('Problèmes dentaires mineurs (carie stade 1)'),
          problem_name: 'Problèmes dentaires mineurs (carie stade 1)',
          evaluation: 'attention',
        });
      }

      // Évaluer les problèmes dentaires majeurs
      if (
        ['Plaque', 'Tartre', 'Débri alimentaire', 'Gingivite'].includes(question) &&
        reponse === '3+') {
        evaluations.push({
          problem_id: this.getProblemIdByName('Problèmes dentaires majeurs'),
          problem_name: 'Problèmes dentaires majeurs',
          evaluation: 'to_follow',
        });
      }

      // Évaluer les caries de stade 2 à 4
      if (question === 'Carie' && reponse === 'Oui' &&
        ['Stade 2', 'Stade 3', 'Stade 4'].includes(this.answers['Si oui, stade carie'])) {
          console.log('Caries (Stade 2 à 4) detected');
        evaluations.push({
          problem_id: this.getProblemIdByName('Caries (Stade 2 à 4)'),
          problem_name: 'Caries (Stade 2 à 4)',
          evaluation: 'to_follow',
        });
      }

      // Évaluer les bouchons de cérumen
      if (
        ['Bouchon de cérumen (oreille gauche)', 'Bouchon de cérumen (oreille droite)'].includes(question) &&
        reponse === 'Oui') {
        evaluations.push({
          problem_id: this.getProblemIdByName('Bouchons de cérumen'),
          problem_name: 'Bouchons de cérumen',
          evaluation: 'attention',
        });
      }

    }

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

  async fetchProblems() {
    const problems = await this.dataService.get('problems');
    this.problems = problems.data || [];
  }

  readyForNexStep(event: any) {
    if (event.target.value) {
      this.studentGender = event.target.value.gender;

      console.log('Selected Student:', event.target.value.gender);
    }
  }


  asyncloadQuestions(event: any) {
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

  getKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj);
  }

  private getProblemIdByName(problemName: string): number {
    // Simulate fetching the problem ID based on the name
    const problem = this.problems.find(p => p.name === problemName);
    return problem ? problem.id : -1;
  }

}


interface Question {
  label: string;
  options?: string[] | null;
  gender: string;
}

interface Exam {
  [key: string]: Question[];
}
