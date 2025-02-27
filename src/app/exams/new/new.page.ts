import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { v4 as uuidv4 } from 'uuid';

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
  selectedProblem: number = 0;
  addedProblems: any[] = [];
  selectedEvaluation: string = "";
  //examTypesInfimier: string[] = ['situation_familiale', 'calendrier_vaccinal', 'deparasitage', 'comportement_langage', 'anamnese'];
  //nom du type d'examen infirmier et son ID
  examTypesInfimier: any[] = [{ 'exam': 'situation_familiale', 'temp_id': null }, { 'exam': 'calendrier_vaccinal', 'temp_id': null }, { 'exam': 'deparasitage', 'temp_id': null }, { 'exam': 'comportement_langage', 'temp_id': null }, { 'exam': 'anamnese', 'temp_id': null }];
  //examTypesMedecin: string[] = ['examen_clinique']
  examTypesMedecin: any[] = [{ 'exam': 'examen_clinique', 'temp_id': null }];
  completedExamTypes: string[] = [];
  answers: { [key: string]: any } = {};
  groupedAnswers: { [key: string]: { [key: string]: any } } = {};
  questions: { [key: string]: any[] | null } = {};
  form: FormGroup;
  presentingElement: Element | null = null;
  studentGender: string = "";
  //user role: tableau de string
  userRoles: String[] = [];

  examId: number = 0;
  dataId: number = 0;
  examCode: string = '';
  step: number = 1;
  isModalOpen = false;

  longitude: number = 0.0;
  latitude: number = 0.0;

  questionsInfirmier: Exam = {
    'situation_familiale': [
      { label: 'Parents_en_vie', options: ['Les deux', 'Mère seulement', 'Père seulement', 'Aucun'], gender: 'both' },
      { label: 'Elève vit avec', options: ['Les deux parents', 'La mère', 'Le père', 'Famille paternelle', 'Famille maternelle', 'Tuteur'], gender: 'both' },
      { label: 'Occupation des parents avec qui élève vit', options: null, gender: 'both' },
      { label: 'Nombre_enfants_fratrie', options: null, gender: 'both' },
      { label: 'Rang_dans_la_fratrie', options: null, gender: 'both' },
      { label: 'Nombre_de_filles', options: null, gender: 'both' },
      { label: 'Nombre_de_garçons', options: null, gender: 'both' },

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
      { label: 'Deparasité_?', options: ['Oui', 'Non', 'Inconnu'], gender: 'both' },
      { label: 'Date_du_dernier_déparasitage', options: null, gender: 'both', parent: 'Deparasité_?', parentValue: 'Oui' },
      { label: 'Médicament_de_déparasitage', options: ['Albendazole 100mg', 'Albendazole 500mg', 'Mebendazole 100mg', 'Mebendazole 500mg'], gender: 'both', parent: 'Deparasité_?', parentValue: 'Oui' },
      { label: 'Fréquence', options: ['Après 1 mois', 'Après 2 mois', 'Après 3 mois', 'Après 4 mois'], gender: 'both', parent: 'Deparasité_?', parentValue: 'Oui' },
    ],
    'comportement_langage': [
      { label: 'Comportement', options: ['Calme', 'Agité', 'Distrait', 'Peureux', 'Curieux', 'Autres'], gender: 'both' },
      { label: 'Si_autre_comportement,_préciser', options: null, gender: 'both', parent: 'Comportement', parentValue: 'Autres' },
      { label: 'Langage', options: ['Cohérent', 'incohérent', 'Autres'], gender: 'both' },
      { label: 'Si_autre_language,_préciser', options: null, gender: 'both', parent: 'Langage', parentValue: 'Autres' },
    ],
    'anamnese': [
      { label: 'Nutrition', options: null, gender: 'both' },
      { label: 'Sommeil', options: null, gender: 'both' },
      { label: 'Exercice_physique', options: null, gender: 'both' },
      { label: 'Hygiènne_corporelle', options: null, gender: 'both' },
      { label: 'Hygiènne_vestimentaire', options: null, gender: 'both' },
      { label: 'Antecedents_personnels', options: null, gender: 'both' },
      { label: 'Antecedents_familiaux', options: null, gender: 'both' },
      { label: 'Allergies', options: null, gender: 'both' },
      { label: 'Traitements_chroniques', options: null, gender: 'both' },
      { label: 'Place_en_classe', options: null, gender: 'both' },
      { label: 'Plaintes_visuelles', options: null, gender: 'both' },
      { label: 'Plaintes_auditives', options: null, gender: 'both' },
      { label: 'Taille_(cm)', options: null, gender: 'both' },
      { label: 'Poids_(kg)', options: null, gender: 'both' },
      { label: 'Pourcentage', options: null, gender: 'both' },
      { label: 'IMC', options: null, gender: 'both' },
      { label: 'acuite_visuelle_loin_droite_sans_correction', options: ['1,00', '0,9', '0,8', '0,7', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1', '0,0'], gender: 'both' },
      { label: 'acuite_visuelle_loin_gauche_sans_correction', options: ['1,00', '0,9', '0,8', '0,7', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1', '0,0'], gender: 'both' },
      { label: 'acuite_loin_droite_avec_lunettes', options: ['1,00', '0,9', '0,8', '0,7', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1', '0,0'], gender: 'both' },
      { label: 'acuite_loin_gauche_avec_lunettes', options: ['1,00', '0,9', '0,8', '0,7', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1', '0,0'], gender: 'both' },
      { label: 'audiometrie_droite_500', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_droite_1000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_droite_2000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_droite_4000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_gauche_500', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_gauche_1000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_gauche_2000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_gauche_4000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Test de la montre gauche ', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Test de la montre droite ', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Test du diapason gauche', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Test du diapason droite', options: ['Bon', 'Pas bon'], gender: 'both' },
    ]
  };

  questionsMedecin: Exam = {
    // ...
    "examen_clinique": [
      { label: "Anamnese", options: null, gender: 'both' },
      { label: "etat_general", options: ['Bon', 'Altéré'], gender: 'both' },
      { label: "etat_general_altéré_par", options: null, gender: 'both', parent: 'etat_general', parentValue: 'Altéré' },
      { label: "dysmorphie", options: ['Malformation de la gorge', 'Malformation de la bouche', 'Malformation du nez', 'Malformation des oreilles', 'Malformation des yeux', 'Malformation des membres', 'Autres'], gender: 'both' },
      { label: "Si_autre_dysmorphie,_préciser", options: null, gender: 'both', parent: 'dysmorphie', parentValue: 'Autres' },
      { label: "Conjonctive", options: ['Palpébrale colorée', 'Palpébrale pâle', 'Bulbaire anicterique', 'Bulbaire ictérique', 'Autres'], gender: 'both' },
      { label: "Si_autre_conjonctive,_préciser", options: null, gender: 'both', parent: 'Conjonctive', parentValue: 'Autres' },
      { label: "Brosse_à_dent", options: ['Oui', 'Non'], gender: 'both' },
      { label: "fréquence_de_brossage", options: null, gender: 'both', parent: 'Brosse_à_dent', parentValue: 'Oui' },
      { label: "utilisation_du_dentifrice", options: ['Oui', 'Non'], gender: 'both', parent: 'Brosse_à_dent', parentValue: 'Oui' },
      { label: "Si_non_utilisation_du_dentifrice,_préciser", options: null, gender: 'both', parent: 'utilisation_du_dentifrice', parentValue: 'Non' },
      { label: "Dentiste", options: ['Oui', 'Non'], gender: 'both' },
      { label: "frequence_visite_dentiste", options: null, gender: 'both', parent: 'Dentiste', parentValue: 'Oui' },
      { label: "Carie", options: ['Oui', 'Non'], gender: 'both' },
      { label: "Si oui, stade carie", options: ['Stade 1', 'Stade 2', 'Stade 3', 'Stade 4'], gender: 'both', parent: 'Carie', parentValue: 'Oui' },
      { label: "Débris_alimentaires", options: ['-', '±', '+', '2+', '3+', '4+'], gender: 'both' },
      { label: 'Plaque', options: ['-', '±', '+', '2+', '3+', '4+'], gender: 'both' },
      { label: 'Tartre', options: ['-', '±', '+', '2+', '3+', '4+'], gender: 'both' },
      { label: 'Gingivite', options: ['-', '±', '+', '2+', '3+', '4+'], gender: 'both' },
      { label: 'gorge', options: ['Saine', 'Pathologique'], gender: 'both' },
      { label: 'Si_gorge_pathologique,_préciser', options: null, gender: 'both', parent: 'gorge', parentValue: 'Pathologique' },
      { label: 'nez', options: ['Normal', 'Pahtologique'], gender: 'both' },
      { label: 'Si_nez_pathologique,_préciser', options: null, gender: 'both', parent: 'nez', parentValue: 'Pathologique' },
      { label: 'oreille_droite', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_oreille_droite_pathologique,_préciser', options: null, gender: 'both', parent: 'oreille_droite', parentValue: 'Pathologique' },
      { label: 'oreille_gauche', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_oreille_gauche_pathologique,_préciser', options: null, gender: 'both', parent: 'oreille_gauche', parentValue: 'Pathologique' },
      { label: 'thyroide', options: ['normale', 'tuméfiée'], gender: 'both' },
      { label: 'ganglions', options: null, gender: 'both' },
      { label: 'Coeur', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_coeur_pathologique,_préciser', options: null, gender: 'both', parent: 'Coeur', parentValue: 'Pathologique' },
      { label: 'Rythme_cardiaque', options: ['Rythme régulier', 'Rythme irrégulier'], gender: 'both' },
      { label: 'Fréquence_cardiaque_(bpm)', options: null, gender: 'both' },
      { label: 'tension_arthérielle', options: null, gender: 'both' },
      { label: 'poumons', options: ['MVP', 'pathologique'], gender: 'both' },
      { label: 'Si_poumons_pathologique,_préciser', options: null, gender: 'both', parent: 'poumons', parentValue: 'Pathologique' },
      { label: 'Peau', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_peau_pathologique,_préciser', options: null, gender: 'both', parent: 'Peau', parentValue: 'Pathologique' },
      { label: 'Cheveux', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_cheveux_pathologique,_préciser', options: null, gender: 'both', parent: 'Cheveux', parentValue: 'Pathologique' },
      { label: 'ongles', options: ['Rien à signaler', 'Pied athlète', 'Onycho-mycose', 'Autres'], gender: 'both' },
      { label: 'Si_autre_problème_ongles,_préciser', options: null, gender: 'both', parent: 'ongles', parentValue: 'Autres' },
      { label: 'Inspection_de_abdomen', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_abdomen_pathologique,_préciser', options: null, gender: 'both', parent: 'Inspection_de_abdomen', parentValue: 'Pathologique' },
      { label: 'Palpation_de_abdomen', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_abdomen_palpation_pathologique,_préciser', options: null, gender: 'both', parent: 'Palpation_de_abdomen', parentValue: 'Pathologique' },
      { label: 'region_inguinale', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_region_inguinale_pathologique,_préciser', options: null, gender: 'both', parent: 'region_inguinale', parentValue: 'Pathologique' },
      { label: 'systeme_uro_genital', options: null, gender: 'both' },
      { label: 'Menarche', options: ['Oui', 'Non'], gender: 'female' },
      { label: 'Si_non,_averti_?', options: ['Oui', 'Non'], gender: 'female', parent: 'Menarche', parentValue: 'Non' },
      { label: 'Volume testicule droite', options: null, gender: 'male' },
      { label: 'Volule testicule gauche', options: null, gender: 'male' },
      { label: 'Score_de_Tanner', options: null, gender: 'both' },
      { label: 'Colonne_vertebrale', options: null, gender: 'both' },
      { label: 'Bassin', options: null, gender: 'both' },
      { label: 'Membres_inferieurs', options: null, gender: 'both' },
      { label: 'Membres_supérieurs', options: null, gender: 'both' },
      { label: 'Demarche', options: ['Bonne', 'Pathologique'], gender: 'both' },
      { label: 'Si_démarche_pathologique,_préciser', options: null, gender: 'both', parent: 'Demarche', parentValue: 'Pathologique' },
      { label: 'Equilibre', options: ['Bon', 'Pathologique'], gender: 'both' },
      { label: 'Si_equilibre_pathologique,_préciser', options: null, gender: 'both', parent: 'Equilibre', parentValue: 'Pathologique' },
      { label: 'fine_motricite', options: ['Bonne', 'Pas bonne'], gender: 'both' },
      { label: 'motricité_pathologique,_préciser', options: null, gender: 'both', parent: 'fine_motricite', parentValue: 'Pas bonne' },
      { label: 'coordination_des_mouvemments', options: ['Bonne', 'Pas bonne'], gender: 'both' },
      { label: 'Si_pas_bonne_coordination_des_mouvements,_préciser', options: null, gender: 'both', parent: 'coordination_des_mouvemments', parentValue: 'Pas bonne' },
      { label: 'reflexe', options: null, gender: 'both' },
      { label: 'reflet_corneen', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Si_pas_bon_reflet_corneen,_préciser', options: null, gender: 'both', parent: 'reflet_corneen', parentValue: 'Pas bon' },
      { label: 'test_occlusion', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Si_pas_bon_test_occlusion,_préciser', options: null, gender: 'both', parent: 'test_occlusion', parentValue: 'Pas bon' },
      { label: "Aspect de l'urine", options: null, gender: 'both' },
      { label: "Leucocytes", options: ['-', '±', '+', '++', '+++'], gender: 'both' },
      { label: "Nitrites", options: ['-', '+'], gender: 'both' },
      { label: "URO", options: ['0', '1', '2', '4', '8', '12'], gender: 'both' },
      { label: "Protéines", options: ['-', '±', '+', '++', '+++', '++++'], gender: 'both' },
      { label: "PH", options: ['5.0', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5'], gender: 'both' },
      { label: "Sang", options: ['1.00', '1.005', '1.010', '1.015', '1.020', '1.025', '1.030'], gender: 'both' },
      { label: "KET", options: ['-', '±', '+', '++', '+++', '++++'], gender: 'both' },
      { label: "BIL", options: ['-', '+', '++', '+++', '++++'], gender: 'both' },
      { label: "Glucose", options: ['-', '±', '+', '++', '+++', '++++'], gender: 'both' },
      { label: 'Points_attention_et_conseils', options: null, gender: 'both' },
      { label: 'Diagnostic', options: null, gender: 'both' },
      { label: 'Traitement', options: null, gender: 'both' },
      { label: 'Examen_supplémentaire', options: null, gender: 'both' },
      // ... autres propriétés
    ],
  };


  constructor(protected fb: FormBuilder, public platform: Platform, private authService: AuthService, private navController: NavController,
    private toastCtrl: ToastController, private appStorage: Storage, private route: ActivatedRoute, private alertController: AlertController,) {
    this.fetchSchoolYears();
    this.fetchProblems();
    this.form = this.fb.group({
      answers: this.fb.group({}) // Dynamically add controls based on selected exam type
    });

    this.fetchUser().then(() => {
      this.fetchRoles().then(() => {
        if (this.userRoles.includes('infirmier')) {
          //initialize id for each exam type
          this.examTypesInfimier.forEach((exam) => {
            exam.temp_id = this.generateExamId();
          });
        } else if (this.userRoles.includes('Medecin')) {
          //initialize id for each exam type
          this.examTypesMedecin.forEach((exam) => {
            exam.temp_id = this.generateExamId();
          });
        }
      });
    });



  }

  ngOnInit() {

    this.examCode = this.generateExamCode();
    this.fetchSchoolYears();






    this.fetchSchools(null).then(() => {
      if (this.route.snapshot.params['id']) {
        this.loadStudent();
      }
    });





    this.presentingElement = document.querySelector('.ion-page');
    this.printCurrentPosition();



  }

  printCurrentPosition = async () => {
    const coordinates = await Geolocation.getCurrentPosition();
    this.latitude = coordinates.coords.latitude;
    this.longitude = coordinates.coords.longitude;
  };

  async loadStudent() {
    let students = await this.appStorage.get('students');
    let stdnt = students.find((student: { id: any; }) => student.id == this.route.snapshot.params['id']);
    if (stdnt) {
      this.studentGender = stdnt.gender;

      this.fetchStudentsByClasse(stdnt.current_class_id).then(() => {
        this.selectedStudent = stdnt.id;
      });
      this.fetchSchoolsByStudentCurrentClassId(stdnt.current_class_id).then(async () => {
        let classes = await this.appStorage.get('classes');
        let cl = classes.find((classe: { id: any; }) => classe.id == stdnt.current_class_id);
        if (cl) {
          this.fetchClassesBySchoolId(cl.school_id).then(() => {
            this.selectedClasse = cl.id;
            this.selectedSchool = cl.school_id;
          });

        }

      });
    }
  }

  initializeAnswers() {
    //check if the user is a nurse or a doctor
    if (this.userRoles.includes('infirmier')) {
      this.questions = this.questionsInfirmier;
      for (let examType in this.questionsInfirmier) {
        this.answers[examType] = {};
      }


    } else if (this.userRoles.includes('Medecin')) {
      this.questions = this.questionsMedecin;
      for (let examType in this.questionsMedecin) {
        this.answers[examType] = {};
      }
    }

  }

  async fetchUser() {
    this.user = await this.appStorage.get('user') || {};
    return this.user;
  }

  async fetchRoles() {
    this.userRoles = await this.appStorage.get('roles') || [];

  }

  save() {

    if (this.userRoles.includes('infirmier')) {
      this.examTypesInfimier.forEach(type => {




        this.groupedAnswers[type.exam] = {};

        this.questionsInfirmier[type.exam].forEach(question => {
          const questionLabel = question.label;

          if (this.answers[questionLabel] !== undefined && this.answers[questionLabel] !== null) {
            
            this.groupedAnswers[type.exam][questionLabel] = this.answers[questionLabel];
            
            
            //this.groupedAnswers[type.exam][questionLabel] = this.answers[questionLabel];
          }


        });


      });
    } else if (this.userRoles.includes('Medecin')) {
      this.examTypesMedecin.forEach(type => {
        this.groupedAnswers[type.exam] = {};

        this.questionsMedecin[type.exam].forEach(question => {
          const questionLabel = question.label;

          if (this.answers[questionLabel] !== undefined && this.answers[questionLabel] !== null) {
            this.groupedAnswers[type][questionLabel] = this.answers[questionLabel];
          }
        });
      });
    }







    //this.evaluateAnswers();

  }

  submitExam() {
    this.save();

    let exams = [];
    this.appStorage.get('exams').then((data) => {
      if (data) {
        exams = data;
      } else {
        exams = [];
      }

      

      if(this.userRoles.includes('infirmier')){

        exams.push({
            id: this.generateExamId(),
            code: this.examCode,
            student_id: this.selectedStudent,
            examiner_id: this.user.id,
            date: new Date().toISOString(),
            latitude: this.latitude,
            longitude: this.longitude,
            data: JSON.stringify(this.groupedAnswers)
        })
      }

      


      /* let examProblems = [];
      this.appStorage.get('evaluations').then((data) => {
        if (data) {
          examProblems = data;
        } else {
          examProblems = [];
        }

        for (const evaluation of this.evaluations) {
          examProblems.push({
            examination_id: this.user.id,
            problem_id: evaluation.problem_id,
            status: evaluation.evaluation
          });
        }

        this.appStorage.set('evaluations', examProblems);
      }); */


      this.appStorage.set('exams', exams).then(() => {
        this.navController.navigateForward('/tabs/exams');
      });



    })
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
    const schoolYears = await this.appStorage.get('schoolYears');
    this.schoolYears = schoolYears || [];
  }

  async fetchSchools(event: any) {
    //fetch schools from local storage based on selected school year
    const result = await this.appStorage.get('schools');

    let schools = result.filter((item: any) => item.status !== 'deleted' && item.group_id == this.user.group_id);

    let ch = schools || [];

    const cls = await this.appStorage.get('classes');
    let cl = cls || [];

    let clas = [];
    for (const c of cl) {
      if (c.schoolYear_id == 1) {
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
    const cls = await this.appStorage.get('classes');
    let cl = cls || [];

    for (const c of cl) {
      if (c.school_id == event.target.value) {
        this.classes.push(c);
      }
    }
  }

  async fetchClassesBySchoolId(schoolId: any) {
    const cls = await this.appStorage.get('classes');
    let cl = cls || [];

    for (const c of cl) {
      if (c.school_id == schoolId) {
        this.classes.push(c);
      }

    }


  }

  async fetchStudents(event: any) {
    const students = await this.appStorage.get('students');
    let std = students || [];

    for (const s of std) {
      if (s.current_class_id == event.target.value) {
        this.students.push(s);
      }
    }

    this.fetchRoles();
  }

  async fetchStudentsByClasse(classId: any) {
    const students = await this.appStorage.get('students');
    let std = students || [];

    for (const s of std) {
      if (s.current_class_id == classId) {
        this.students.push(s);
      }
    }

    this.fetchRoles();
  }

  async fetchSchoolsByStudentCurrentClassId(classId: any) {

    const cls = await this.appStorage.get('classes');
    if (cls) {
      let classe = cls.find((c: { id: any }) => c.id === classId)
      if (classe) {
        const schools = await this.appStorage.get('schools');

        let ch = schools.filter((item: any) => item.status !== 'deleted' && item.group_id == this.user.group_id) || [];

        const cls = await this.appStorage.get('classes');
        let cl = cls || [];

        let clas = [];
        for (const c of cl) {
          if (c.schoolYear_id == classe.schoolYear_id) {
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

    }

  }



  async fetchProblems() {
    const problems = await this.appStorage.get('problems');
    this.problems = problems || [];
  }

  readyForNexStep(event: any) {
    if (event.target.value) {
      let stdnt = this.students.find((s: { id: any }) => s.id === event.target.value);
      if (stdnt) {
        this.studentGender = stdnt.gender;
        if (this.userRoles.includes('infirmier')) {
          this.step = 1;
        } else if (this.userRoles.includes('Medecin')) {
          this.step = 6;
        }
      }



    }
  }



  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  formatLabel(label: string): string {
    return label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  getProblemNameById(problem_id: number) {
    const problem = this.problems.find(p => p.id === problem_id);

    return problem.name;
  }

  generateExamId() {

    this.examId = Math.floor(Math.random() * 1000000000000000000);
    this.appStorage.get('exams').then((result) => {
      if (result) {
        let exam = result.find((sch: any) => sch.id == this.examId);
        if (exam) {
          this.generateExamId();
        }
      }
    });

    return this.examId;
  }

  generateDataId() {

    this.dataId = Math.floor(Math.random() * 1000000000000000000);
    this.appStorage.get('exams-data').then((result) => {
      if (result) {
        let exam = result.find((sch: any) => sch.id == this.dataId);
        if (exam) {
          this.generateDataId();
        }
      }
    });

    return this.dataId;
  }

  generateExamCode() {

    //générer un code alaphanumérique de 10 caractères

    this.examCode = uuidv4();
    this.appStorage.get('exams').then((result) => {
      if (result) {
        let exam = result.find((sch: any) => sch.code == this.examCode);
        if (exam) {
          this.generateExamCode();
        }
      }
    });

    return this.examCode;
  }

  goToStep2() {
    this.step = 2;
  }

  goToStep3() {
    this.step = 3;
  }

  goToStep4() {
    this.step = 4;
  }

  goToStep5() {
    this.step = 5;
  }

  goToStep6() {
    this.step = 6;
  }

  goToStep7() {
    this.step = 7;
  }


  retour() {
    if (this.step == 7) {
      if (this.userRoles.includes('infirmier')) {
        this.step = 5;
      } else if (this.userRoles.includes('Medecin')) {
        this.step = 6;
      }
    } else {
      this.step = this.step - 1;
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  addProblem() {
    this.evaluations.push({
      problem_id: this.selectedProblem,
      problem_name: this.getProblemNameById(this.selectedProblem),
      evaluation: this.selectedEvaluation,
    });

    this.selectedProblem = 0;
    this.selectedEvaluation = "";
  }

  isInArray(problemId: number): boolean {
    return this.evaluations.find(e => e.problem_id === problemId) !== undefined;
  }

  exit() {
    this.selectedStudent = null;
    this.selectedSchool = null;
    this.selectedClasse = null;
    this.navController.navigateForward('/tabs/exams');
  }

  runTimeChange(event: any) {

    if (event.target.name === 'Taille_(cm)' || event.target.name === 'Poids_(kg)') {
      if (this.answers['Taille_(cm)'] && this.answers['Poids_(kg)']) {

        const taille = parseFloat(this.answers['Taille_(cm)']);
        const poids = parseFloat(this.answers['Poids_(kg)']);
        const tailleM = taille / 100;
        const imc = poids / (tailleM * tailleM);
        this.answers['IMC'] = imc.toFixed(2);


        //calcul du poid idéal selon La formule de Lorentz
        let poidIdeal = 0;
        if (this.studentGender === 'male') {
          poidIdeal = (taille - 100) - ((taille - 150) / 4);
        } else if (this.studentGender === 'female') {
          poidIdeal = (taille - 100) - ((taille - 150) / 2.5);
        }

        const pourcentage = (poids / poidIdeal) * 100;

        this.answers['Pourcentage'] = pourcentage.toFixed(2);
      }
    } else if (event.target.name === 'Rang_dans_la_fratrie') {

      if (this.answers['Rang_dans_la_fratrie'] && this.answers['Nombre_enfants_fratrie']) {

        if (this.answers['Rang_dans_la_fratrie'] > this.answers['Nombre_enfants_fratrie']) {
          console.log(this.answers['Nombre_enfants_fratrie'])
          const alert = this.alertController.create({
            header: 'Rang supérieur au nombre enfants',
            buttons: [
              {
                text: 'Fermer',
                role: 'cancel',
                cssClass: 'secondary',
              },
            ]
          });

          alert.then((al) => {
            al.present();
          });
        }
      }
    } else if (event.target.name === 'Nombre_de_filles' || event.target.name === 'Nombre_de_garçons') {
      if (this.answers['Nombre_de_filles'] && this.answers['Nombre_de_garçons']) {
        const total = parseInt(this.answers['Nombre_de_filles']) + parseInt(this.answers['Nombre_de_garçons']);
        if (this.answers['Nombre_enfants_fratrie'] && this.answers['Nombre_enfants_fratrie'] !== total) {
          const alert = this.alertController.create({
            header: 'Nombre total d\'enfants incorrect',
            buttons: [
              {
                text: 'Fermer',
                role: 'cancel',
                cssClass: 'secondary'
              },
            ]
          });

          alert.then((al) => {
            al.present();
          });
        }
      }

    }

  }

}


interface Question {
  label: string;
  options?: string[] | null;
  gender: string;
  parent?: string;
  parentValue?: string;
}

interface Exam {
  [key: string]: Question[];
}
