import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, NavController, Platform, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { v4 as uuidv4 } from 'uuid';
import { ApiService } from 'src/app/services/api.service';
import { lastValueFrom } from 'rxjs';
import { Network, ConnectionStatus } from '@capacitor/network';

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
  selectedProblems: number[] = [];
  addedProblems: any[] = [];
  //suggestedProblems must be an array of problem id and localisation qui est un tableau de question-réponse
  suggestedProblems: { id: number, localisations: { [key: string]: any } }[] = [];
  //suggestedProblems: number[] = [];
  suggestedEvaluations: { [key: number]: string } = {};
  /* selectedEvaluation: string = ""; */
  selectedEvaluation: string | null = null;
  selectedTraitment: string | null = null;
  selectedConseil: string | null = null;
  selectedRaison: string | null = null;

  //nom du type d'examen infirmier et son ID
  /* examTypesInfimier: any[] = [{ 'exam': 'situation_familiale', 'temp_id': null }, { 'exam': 'calendrier_vaccinal', 'temp_id': null }, { 'exam': 'deparasitage', 'temp_id': null }, { 'exam': 'comportement_langage', 'temp_id': null }, { 'exam': 'anamnese', 'temp_id': null }]; */
  //examTypesMedecin: string[] = ['examen_clinique']
  /* examTypesMedecin: any[] = [{ 'exam': 'examen_clinique', 'temp_id': null }]; */
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
  examTypesInfimier: string[] = ['situation_familiale', 'calendrier_vaccinal', 'deparasitage', 'comportement_langage', 'anamnese'];
  questionsInfirmier: Exam = {
    'situation_familiale': [
      { label: 'Parents_en_vie', options: ['Les deux', 'Mère seulement', 'Père seulement', 'Aucun'], gender: 'both' },
      { label: 'Elève_vit_avec', options: ['Les deux parents', 'La mère', 'Le père', 'Famille paternelle', 'Famille maternelle', 'Tuteur'], gender: 'both' },
      { label: 'Occupation_des_parents_avec_qui_élève_vit', options: null, gender: 'both' },
      { label: 'Nombre_enfants_fratrie', options: null, gender: 'both' },
      { label: 'Rang_dans_la_fratrie', options: null, gender: 'both' },
      { label: 'Nombre_de_filles', options: null, gender: 'both' },
      { label: 'Nombre_de_garçons', options: null, gender: 'both' },
      { label: 'L\'enfant_vit_bien_à_l\'école', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'L\'enfant_vit_bien_à_la_maison', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Si_enfant_ne_vit_pas_bien_à_l\'école,_pourquoi_?', options: null, gender: 'both', parent: 'L\'enfant_vit_bien_à_l\'école', parentValue: 'Non' },
      { label: 'Si_enfant_ne_vit_pas_bien_à_la_maison,_pourquoi_?', options: null, gender: 'both', parent: 'L\'enfant_vit_bien_à_la_maison', parentValue: 'Non' },

    ],
    'calendrier_vaccinal': [
      { label: 'BCG_(tuberculose)', options: ['Lisible', 'Non lisible', 'Douteux'], gender: 'both' },
      { label: 'VPO_(poliomyélite)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'DTCoq-Hép-B-Hib', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'PCV-13_(pneumo)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'VAR_(rougeole)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'VAA_(fièvre jaune)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
      { label: 'DTCoq_(diphtérie,_tétanos,_coqueluce)', options: ['Fait', 'Non fait', 'Inconnu'], gender: 'both' },
    ],
    'deparasitage': [
      { label: 'Déparasité_?', options: ['Oui', 'Non', 'Inconnu'], gender: 'both' },
      /* { label: 'Date_du_dernier_déparasitage', options: null, gender: 'both', parent: 'Deparasité_?', parentValue: 'Oui' }, */

      { label: 'Fréquence', options: ['Inconnu', 'Suffisant', 'Insuffisant', 'Excédent'], gender: 'both', parent: 'Déparasité_?', parentValue: 'Oui' },
      { label: 'Médicament_de_déparasitage', options: ['Vermox 500mg', 'Vermox 100mg', 'Autres'], gender: 'both', parent: 'Déparasité_?', parentValue: 'Oui' },
      { label: 'Si_autre_médicament_de_déparasitage,_préciser', options: null, gender: 'both', parent: 'Médicament_de_déparasitage', parentValue: 'Autres' },
    ],
    'comportement_langage': [
      { label: 'Comportement', options: ['Calme', 'Agité', 'Distrait', 'Peureux', 'Curieux', 'Pathologie'], gender: 'both' },
      { label: 'Si_autre_comportement,_préciser', options: null, gender: 'both', parent: 'Comportement', parentValue: 'Pathologie' },
      { label: 'Langage', options: ['Cohérent', 'Incohérent', 'Autres'], gender: 'both' },
      { label: 'Si_autre_language,_préciser', options: null, gender: 'both', parent: 'Langage', parentValue: 'Autres' },
    ],
    'anamnese': [
      { label: 'Nutrition', options: ['Insuffisante', 'Bonne'], gender: 'both' },
      { label: 'Préciser_nutrition', options: null, gender: 'both' },
      { label: 'Sommeil', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Préciser_sommeil', options: null, gender: 'both' },
      { label: 'Exercice_physique', options: ['Présent', 'Absent'], gender: 'both' },
      { label: 'Préciser_exercice_physique', options:null, gender: 'both' },
      { label: 'Hygiène_corporelle', options: ['Bonne', 'Pas bonne'], gender: 'both' },
      { label: 'Préciser_hygiène_corporelle', options: null, gender: 'both' },
      { label: 'Hygiène_vestimentaire', options: ['Bonne', 'Pas bonne'], gender: 'both' },
      { label: 'Préciser_hygiène_vestimentaire', options: null, gender: 'both' },
      { label: 'Antecedents_personnels', options: ['Aucun', 'Mineur', 'Majeur'], gender: 'both' },
      { label: 'Si_mineur,_préciser', options: null, gender: 'both', parent: 'Antecedents_personnels', parentValue: 'Mineur' },
      { label: 'Si_majeur,_préciser', options: null, gender: 'both', parent: 'Antecedents_personnels', parentValue: 'Majeur' },
      { label: 'Antecedents_familiaux', options: ['Aucun', 'Présents'], gender: 'both' },
      { label: 'Si_antécédents_familiaux_présents,_préciser', options: null, gender: 'both', parent: 'Antecedents_familiaux', parentValue: 'Présents'},
      { label: 'Allergies', options: ['Présente', 'Absente'], gender: 'both' },
      { label: 'Si_allergie_présente,_préciser', options: null, gender: 'both', parent: 'Allergies', parentValue: 'Présente'},
      { label: 'Traitements_chroniques', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Si_traitements_chroniques,_préciser', options: null, gender: 'both', parent: 'Traitements_chroniques', parentValue: 'Oui' },
      { label: 'Place_en_classe', options: null, gender: 'both' },
      { label: 'Plaintes_visuelles', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Si_plaintes_visuelles,_préciser', options: null, gender: 'both', parent: 'Plaintes_visuelles', parentValue: 'Oui' },
      { label: 'Plaintes_auditives', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Si_plaintes_auditives,_préciser', options: null, gender: 'both', parent: 'Plaintes_auditives', parentValue: 'Oui'},
      { label: 'Taille_(cm)', options: null, gender: 'both' },
      { label: 'Poids_(kg)', options: null, gender: 'both' },
      { label: 'Pourcentage', options: null, gender: 'both' },
      { label: 'IMC', options: null, gender: 'both' },
      { label: 'Test_acuité_visuelle', options: ['Sans lunettes', 'Avec lunettes'], gender: 'both' },
      { label: 'acuite_visuelle_oeil_droite_sans_correction', options: ['1.00', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1', '0.0'], gender: 'both', parent: 'Test_acuité_visuelle', parentValue: 'Sans lunettes' },
      { label: 'acuite_visuelle_oeil_gauche_sans_correction', options: ['1.00', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1', '0.0'], gender: 'both', parent: 'Test_acuité_visuelle', parentValue: 'Sans lunettes' },
      { label: 'acuite_visuelle_oeil_droite_avec_lunettes', options: ['1.00', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1', '0.0'], gender: 'both', parent: 'Test_acuité_visuelle', parentValue: 'Avec lunettes' },
      { label: 'acuite_visuelle_oeil_gauche_avec_lunettes', options: ['1.00', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1', '0.0'], gender: 'both', parent: 'Test_acuité_visuelle', parentValue: 'Avec lunettes' },
      { label: 'audiometrie_droite_500', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_droite_1000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_droite_2000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_droite_4000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_gauche_500', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_gauche_1000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_gauche_2000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'audiometrie_gauche_4000', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Test_de_la_montre', options: ['Oui', 'Non'], gender: 'both' },
      { label: 'Test_de_la_montre_gauche ', options: ['Bon', 'Pas bon'], gender: 'both', parentValue: 'Oui', parent: 'Test_de_la_montre' },
      { label: 'Test_de_la_montre_droite ', options: ['Bon', 'Pas bon'], gender: 'both', parentValue: 'Oui', parent: 'Test_de_la_montre' },
      { label: 'Test_du_diapason', options: ['Oui', 'Non'], gender: 'both', parent: 'Test_de_la_montre', parentValue: 'Non' },
      { label: 'Test_du_diapason_gauche', options: ['Bon', 'Pas bon'], gender: 'both', parentValue: 'Oui', parent: 'Test_du_diapason' },
      { label: 'Test_du_diapason_droite', options: ['Bon', 'Pas bon'], gender: 'both', parentValue: 'Oui', parent: 'Test_du_diapason' },
    ]
  };
  examTypesMedecin: string[] = ["Anamnèse", "Aspect_gén./Dysmorphie", "Yeux_/_Conjoctives", "Bouche_/_Dents", "ORL_/_Cou", "Cardiorespiratoire", "Peau_/_Cheveux_/_Ongles", "Abdomen", "(Pré)puberté", "Appareil_locomoteur", "Examen neurologique","Examen_urinaire"/* , "Examen_clinique" */];
  questionsMedecin: Exam = {
    // ...
    'Anamnèse': [
      { label: 'Anamnese', options: ['Sans particularité', 'Plainte'], gender: 'both' },
      { label: 'Plainte_d\'anemnèse', options: null, gender: 'both', parent: 'Anamnese', parentValue: 'Plainte'}

    ],
    "Aspect_gén./Dysmorphie": [
      { label: "Aspect_general", options: ['Bon', 'Altéré'], gender: 'both' },
      { label: "Aspect_general_altéré_par", options: null, gender: 'both', parent: 'Aspect_general', parentValue: 'Altéré' },
      { label: "Dismorphie", options: ['Oui', 'Non'], gender: 'both' },
      { label: "Type_de_dysmorphie", options: ['Malformation de la gorge', 'Malformation de la bouche', 'Malformation du nez', 'Malformation des oreilles', 'Malformation des yeux', 'Malformation des membres', 'Autres'], gender: 'both', parent: 'Dismorphie', parentValue: 'Oui' },
      { label: "Si_autre_dysmorphie,_préciser", options: null, gender: 'both', parent: 'Type_de_dysmorphie', parentValue: 'Autres' },
    ],
    "Yeux_/_Conjoctives": [
      { label: "Conjonctive_palpébrale", options: ['Colorée', 'Non colorée', 'Autres'], gender: 'both' },
      { label: "Si_autre_conjonctive_palpébrale,_préciser", options: null, gender: 'both', parent: 'Conjonctive_palpébrale', parentValue: 'Autres' },
      { label: "Conjonctive_bulbaire", options: ['Icterique', 'Anicterique', 'Autre'], gender: 'both' },
      { label: "Si_autre_conjonctive_bulbaire,_préciser", options: null, gender: 'both', parent: 'Conjonctive_bulbaire', parentValue: 'Autre' },
      { label: 'reflet_corneen', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Si_pas_bon_reflet_corneen,_préciser', options: null, gender: 'both', parent: 'reflet_corneen', parentValue: 'Pas bon' },
      { label: 'test_occlusion', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Si_pas_bon_test_occlusion,_préciser', options: null, gender: 'both', parent: 'test_occlusion', parentValue: 'Pas bon' },
    ],
    "Bouche_/_Dents": [
      { label: "Brosse_à_dent", options: ['Oui', 'Non', 'Autres'], gender: 'both' },
      { label: "Si_autre_brosse_à_dent,_préciser", options: null, gender: 'both', parent: 'Brosse_à_dent', parentValue: 'Autres' },
      { label: "fréquence_de_brossage", options: null, gender: 'both', parent: 'Brosse_à_dent', parentValue: 'Oui' },
      { label: "utilisation_du_dentifrice", options: ['Oui', 'Non', 'Autres'], gender: 'both' },
      { label: "Si_autre_dentifrice,_préciser", options: null, gender: 'both', parent: 'utilisation_du_dentifrice', parentValue: 'Autres' },
      { label: "Dentiste", options: ['Oui', 'Non'], gender: 'both' },
      { label: "frequence_visite_dentiste", options: null, gender: 'both', parent: 'Dentiste', parentValue: 'Oui' },
      { label: "Carie", options: ['Oui', 'Non'], gender: 'both' },
      { label: "Nombre_de_dents_carieuses", options: null, gender: 'both', parent: 'Carie', parentValue: 'Oui' },
      /* { label: "Si_oui,_stade_carie", options: ['Stade 1', 'Stade 2', 'Stade 3', 'Stade 4'], gender: 'both', parent: 'Carie', parentValue: 'Oui' }, */
      { label: "Débris_alimentaires", options: ['-', '±', '+', '2+', '3+', '4+'], gender: 'both' },
      { label: 'Plaque', options: ['-', '±', '+', '2+', '3+', '4+'], gender: 'both' },
      { label: 'Tartre', options: ['-', '±', '+', '2+', '3+', '4+'], gender: 'both' },
      { label: 'Gingivite', options: ['-', '+', '±', '++', '+++', '++++'], gender: 'both' },
    ],
    "ORL_/_Cou": [
      { label: 'gorge', options: ['Saine', 'Pathologique'], gender: 'both' },
      { label: 'Si_gorge_pathologique,_préciser', options: null, gender: 'both', parent: 'gorge', parentValue: 'Pathologique' },
      { label: 'nez', options: ['Normal', 'Pahtologique'], gender: 'both' },
      { label: 'Si_nez_pathologique,_préciser', options: null, gender: 'both', parent: 'nez', parentValue: 'Pahtologique' },
      { label: 'oreille_droite', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_oreille_droite_pathologique,_préciser', options: null, gender: 'both', parent: 'oreille_droite', parentValue: 'Pathologique' },
      { label: 'oreille_gauche', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_oreille_gauche_pathologique,_préciser', options: null, gender: 'both', parent: 'oreille_gauche', parentValue: 'Pathologique' },
      { label: 'thyroide', options: ['Normale', 'Pathologique'], gender: 'both' },
      { label: 'Si_thyroide_pathologique,_préciser', options: null, gender: 'both', parent: 'thyroide', parentValue: 'Pathologique' },
      { label: 'ganglions', options: ['Présent', 'Absent'], gender: 'both' },
      { label: 'Si_ganglions_présents,_préciser', options: null, gender: 'both', parent: 'ganglions', parentValue: 'Présent' },
    ],
    "Cardiorespiratoire": [
      { label: 'Coeur', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_coeur_pathologique,_préciser', options: ['Hypotension', 'Hypertension'], gender: 'both', parent: 'Coeur', parentValue: 'Pathologique' },
      { label: 'Rythme_cardiaque', options: ['Rythme régulier', 'Rythme irrégulier'], gender: 'both' },
      { label: 'Fréquence_cardiaque_(bpm)', options: null, gender: 'both' },
      { label: 'Tension_arthérielle', options: ['Normal', 'Basse', 'élevée'], gender: 'both' },
      { label: 'Tension (mmHg)', options: null, gender: 'both' },
      { label: 'Poumons', options: ['MVP', 'Pathologique'], gender: 'both' },
      { label: 'Si_poumons_pathologique,_préciser', options: null, gender: 'both', parent: 'Poumons', parentValue: 'Pathologique' },
    ],
    "Peau_/_Cheveux_/_Ongles": [
      { label: 'Peau', options: ['Normal', 'Mycose', 'Plaie', 'Gâle', 'Coupures', 'brûlures', 'Autres'], gender: 'both' },
      { label: 'Si_peau_mycoseuse,_préciser', options: null, gender: 'both', parent: 'Peau', parentValue: 'Mycose' },
      { label: 'Si_plaie_à_la_peau,_préciser', options: null, gender: 'both', parent: 'Peau', parentValue: 'Plaie' },
      { label: 'Si_peau_gâleuse,_préciser', options: null, gender: 'both', parent: 'Peau', parentValue: 'Gâle' },
      { label: 'Si_coupure_de_la_peau,_préciser', options: null, gender: 'both', parent: 'Peau', parentValue: 'Coupures' },
      { label: 'Si_brûlure_de_la_peau,_préciser', options: null, gender: 'both', parent: 'Peau', parentValue: 'brûlures' },
      { label: 'Si_autres_pathologie_de_la_peau,_préciser', options: null, gender: 'both', parent: 'Peau', parentValue: 'Autres' },
      { label: 'Cheveux', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_cheveux_pathologique,_préciser', options: null, gender: 'both', parent: 'Cheveux', parentValue: 'Pathologique' },
      { label: 'Ongles', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_ongles_pathologique,_préciser', options: null, gender: 'both', parent: 'Ongles', parentValue: 'Pathologique' },
      { label: 'Orteilles', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_orteilles_pathologique,_préciser', options: null, gender: 'both', parent: 'Orteilles', parentValue: 'Pathologique' },
    ],
    "Abdomen": [
      { label: 'Inspection_de_l\'abdomen', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_abdomen_pathologique,_préciser', options: null, gender: 'both', parent: 'Inspection_de_l\'abdomen', parentValue: 'Pathologique' },
      { label: 'Palpation_de_abdomen', options: ['Normal','Pathologique'], gender: 'both' },
      { label: 'Si_abdomen_palpation_Pathologique,_préciser', options: null, gender: 'both', parent: 'Palpation_de_abdomen', parentValue: 'Pathologique' },
      { label: 'region_inguinale', options: ['Normal','Hernie', 'Autre pathologie'], gender: 'both' },
      { label: 'Si_region_inguinale_pathologique,_préciser', options: null, gender: 'both', parent: 'region_inguinale', parentValue: 'Autre pathologie' },
    ],
    "(Pré)puberté": [
      { label: 'Menarche', options: ['Oui', 'Non'], gender: 'female' },
      { label: 'Début', options: null, gender: 'female', parent: 'Menarche', parentValue: 'Oui' },
      { label: 'Fréquence', options: ['Régulier', 'Irrégulier'], gender: 'female', parent: 'Menarche', parentValue: 'Oui' },
      { label: 'Nombre_de_jours', options: ['Moins de 10 jours', 'Plus de 10 jours'], gender: 'female', parent: 'Menarche', parentValue: 'Oui' },
      { label: 'Dysménorrhée', options: ['-', '±', '+', '++'], gender: 'female', parent: 'Menarche', parentValue: 'Oui' },
      { label: 'Testicule', options: ['Normal', 'Varicocelle', 'Hernie', 'Absente', "Autre pathologie"], gender: 'male'},
      { label: 'Si_testicule_pathologique,_préciser', options: null, gender: 'male', parent: 'Testicule', parentValue: 'Autre pathologie' },
      { label: 'Score_de_Tanner_(Poils)', options: ['1', '2', '3', '4', '5'], gender: 'male' },
      { label: 'Score_de_Tanner_(Gonades)', options: ['1', '2', '3', '4', '5'], gender: 'male' },
      { label: 'Score_de_Tanner_(P)', options: ['1', '2', '3', '4', '5'], gender: 'female' },
      { label: 'Score_de_Tanner_(M)', options: ['1', '2', '3', '4', '5'], gender: 'female' },
      { label: 'Interpretation_score_de_tanner', options: ['Normale', 'Pas normal'], gender: 'both' }
    ],
    "Appareil_locomoteur": [
      { label: 'Colonne_vertebrale', options: ['Normale', 'Pathologique'], gender: 'both' },
      { label: 'Si_colonne_vertebrale_pathologique,_préciser', options: null, gender: 'both', parent: 'Colonne_vertebrale', parentValue: 'Pathologique' },
      { label: 'Bassin', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_bassin_pathologique,_préciser', options: null, gender: 'both', parent: 'Bassin', parentValue: 'Pathologique' },
      { label: 'Membres_inferieurs', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_membres_inferieurs_pathologique,_préciser', options: null, gender: 'both', parent: 'Membres_inferieurs', parentValue: 'Pathologique' },
      { label: 'Membres_supérieurs', options: ['Normal', 'Pathologique'], gender: 'both' },
      { label: 'Si_membres_supérieurs_pathologique,_préciser', options: null, gender: 'both', parent: 'Membres_supérieurs', parentValue: 'Pathologique' },
      { label: 'Demarche', options: ['Bonne', 'Pathologique'], gender: 'both' },
      { label: 'Si_démarche_pathologique,_préciser', options: null, gender: 'both', parent: 'Demarche', parentValue: 'Pathologique' },
      { label: 'Equilibre', options: ['Bon', 'Pathologique'], gender: 'both' },
      { label: 'Si_equilibre_pathologique,_préciser', options: null, gender: 'both', parent: 'Equilibre', parentValue: 'Pathologique' },
    ],
    "Examen neurologique": [
      { label: 'fine_motricite', options: ['Bonne', 'Pas bonne'], gender: 'both' },
      { label: 'motricité_pathologique,_préciser', options: null, gender: 'both', parent: 'fine_motricite', parentValue: 'Pas bonne' },
      { label: 'coordination_des_mouvemments', options: ['Bonne', 'Pas bonne'], gender: 'both' },
      { label: 'Si_pas_bonne_coordination_des_mouvements,_préciser', options: null, gender: 'both', parent: 'coordination_des_mouvemments', parentValue: 'Pas bonne' },
      { label: 'reflexe', options: ['Bon', 'Pas bon'], gender: 'both' },
      { label: 'Si_pas_bon_reflexe,_préciser', options: null, gender: 'both', parent: 'reflexe', parentValue: 'Pas bon' },
    ],
    "Examen_urinaire": [

      { label: 'Problème_urinaire', options: ['Oui', 'Non'], gender: 'both' },
      { label: "Aspect_de_l'urine", options: null, gender: 'both', parent: 'Problème_urinaire', parentValue: 'Oui' },
      { label: "Leucocytes", options: ['-', '±', '+', '++', '+++'], gender: 'both', parent: 'Problème_urinaire', parentValue: 'Oui' },
      { label: "Nitrites", options: ['-', '+'], gender: 'both', parent: 'Problème_urinaire', parentValue: 'Oui' },
      /* { label: "URO", options: ['0', '1', '2', '4', '8', '12'], gender: 'both' }, */
      { label: "Protéines", options: ['-', '±', '+', '++', '+++', '++++'], gender: 'both', parent: 'Problème_urinaire', parentValue: 'Oui' },
      { label: "PH", options: ['5.0', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5'], gender: 'both', parent: 'Problème_urinaire', parentValue: 'Oui' },
      { label: "Sang_(hermaturie)", options: ['1.00', '1.005', '1.010', '1.015', '1.020', '1.025', '1.030'], gender: 'both', parent: 'Problème_urinaire', parentValue: 'Oui' },
      { label: "KET", options: ['-', '±', '+', '++', '+++', '++++'], gender: 'both', parent: 'Problème_urinaire', parentValue: 'Oui' },
      { label: "BIL", options: ['-', '+', '++', '+++', '++++'], gender: 'both', parent: 'Problème_urinaire', parentValue: 'Oui' },
      { label: "Glucose", options: ['-', '±', '+', '++', '+++', '++++'], gender: 'both', parent: 'Problème_urinaire', parentValue: 'Oui' },
    ],
    /* "Examen_clinique": [
      { label: 'Points_attention_et_conseils', options: null, gender: 'both' },
      { label: 'Diagnostic', options: null, gender: 'both' },
      { label: 'Traitement', options: null, gender: 'both' },
      { label: 'Examen_supplémentaire', options: null, gender: 'both' },
    ], */
  };

  classesToSync: any = [];
  studentsToSync: any = [];
  schoolToSync: any = [];
  examsToSync: any = [];
  exams: any = null;

  networkStatus: ConnectionStatus;
  loading: HTMLIonLoadingElement | null = null;


  constructor(protected fb: FormBuilder, public platform: Platform, private authService: AuthService, private navController: NavController,
    private toastCtrl: ToastController, private appStorage: Storage, private route: ActivatedRoute, private alertController: AlertController, private apiService: ApiService, private loadingCtrl: LoadingController) {
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
            //exam.temp_id = this.generateExamId();
          });
        } else if (this.userRoles.includes('Medecin')) {

          //initialize id for each exam type
          this.examTypesMedecin.forEach((exam) => {
            //exam.temp_id = this.generateExamId();

            this.step = 6;
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

        this.loadExam();
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

  async loadExam() {
    let exams = await this.appStorage.get('exams');
    let exam = exams.find((exam: { student_id: any; }) => exam.student_id == this.route.snapshot.params['id']);

    if (exam) {
      this.examCode = exam.code;
      this.groupedAnswers = JSON.parse(exam.data);
      this.selectedStudent = exam.student_id;
      this.examId = exam.id;
      this.latitude = exam.latitude;
      this.longitude = exam.longitude;

      if (this.userRoles.includes('Medecin')) {
        this.step = 6;
        this.examTypesInfimier.forEach((exam) => {
          this.questionsInfirmier[exam].forEach((question) => {
            if (this.groupedAnswers[exam][question.label] !== undefined && this.groupedAnswers[exam][question.label] !== null) {
              this.answers[question.label] = this.groupedAnswers[exam][question.label];
            }
          });
        }
        );

        this.examTypesMedecin.forEach((exam) => {
          this.questionsMedecin[exam].forEach((question) => {
            if (this.groupedAnswers[exam][question.label] !== undefined && this.groupedAnswers[exam][question.label] !== null) {
              this.answers[question.label] = this.groupedAnswers[exam][question.label];
            }
          });
        }
        );
      }
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

  async save() {

    this.checkSchoolsToSync();
    await this.checkClassesToSync();
    this.checkStudentsToSync();

    if (this.userRoles.includes('infirmier')) {
      this.examTypesInfimier.forEach(type => {
        this.groupedAnswers[type] = {};

        this.questionsInfirmier[type].forEach(question => {
          const questionLabel = question.label;

          if (this.answers[questionLabel] !== undefined && this.answers[questionLabel] !== null) {

            this.groupedAnswers[type][questionLabel] = this.answers[questionLabel];


            //this.groupedAnswers[type.exam][questionLabel] = this.answers[questionLabel];
          }


        });


      });
    } else if (this.userRoles.includes('Medecin')) {

      this.examTypesMedecin.forEach(type => {
        this.groupedAnswers[type] = {};

        this.questionsMedecin[type].forEach(question => {
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
    this.presentLoading('Enregistrement de l\'examen en cours...');
    this.save();

    let exams = [];
    this.appStorage.get('exams').then(async (data) => {
      if (data) {
        exams = data;
      } else {
        exams = [];
      }



      if (this.userRoles.includes('infirmier')) {

        exams.push({
          id: await this.generateExamId(),
          code: this.examCode,
          student_id: this.selectedStudent,
          examiner_id: this.user.id,
          date: new Date().toISOString(),
          latitude: this.latitude,
          longitude: this.longitude,
          data: JSON.stringify(this.groupedAnswers)
        })
      } else if (this.userRoles.includes('Medecin')) {
        let exm = exams.find((exam: { student_id: any; }) => exam.student_id == this.selectedStudent);
        if (exm) {

          let examData = JSON.parse(exm.data);
          let newExamData = this.groupedAnswers;

          const combinedData = {
            ...examData,
            ...newExamData
          };

          exams.splice(exams.indexOf(exm), 1);

          exams.push({
            id: exm.id,
            code: exm.code,
            student_id: exm.student_id,
            examiner_id: exm.examiner_id,
            doctor_id: this.user.id,
            date: exm.date,
            latitude: exm.latitude,
            longitude: exm.longitude,
            data: JSON.stringify(combinedData),
            status: "updated",
            created_at: exm.created_at,
            updated_at: exm.updated_at
          });

        } else {
          this.alertController.create({
            header: 'Erreur',
            message: 'L\'infimier n\'a pas encore exmaniné cet élève ! Voulez-vous continuer ?',
            buttons: [
              {
                text: 'Oui',
                handler: () => {
                  exams.push({
                    id: this.generateExamId(),
                    code: this.examCode,
                    student_id: this.selectedStudent,
                    doctor_id: this.user.id,
                    date: new Date().toISOString(),
                    latitude: this.latitude,
                    longitude: this.longitude,
                    data: JSON.stringify(this.groupedAnswers)
                  });
                }
              },
              {
                text: 'Non',
                handler: () => { }
              }
            ]
          }).then(alert => alert.present());
        }

      }


      let ex = exams.find((exam: { student_id: any; }) => exam.student_id == this.selectedStudent);
      if (ex) {
        let examProblems = [];
        this.appStorage.get('evaluations').then(async (data) => {
          if (data) {
            examProblems = data;
          } else {
            examProblems = [];
          }


          for (const evaluation of this.evaluations) {
            examProblems.push({
              examination_id: ex.id,
              problem_id: evaluation.problem_id,
              status: evaluation.evaluation,
              traitement: evaluation.traitment,
              conseil: evaluation.conseil,
              raison: evaluation.raison,
              //JSON encode localisation
              localisations: JSON.stringify(evaluation.localisations)
            });
          }

          console.log('examProblems', examProblems);
          await this.appStorage.set('evaluations', examProblems);
        });
      }





      this.exams = exams;

      this.appStorage.set('exams', exams).then(() => {
        /* Network.getStatus().then(async status => {
          this.networkStatus = status;
          if (this.networkStatus.connected) {
            if (this.classesToSync.length > 0) {
              this.storeClassesToAPI().then(() => {
                //
              });
            }
          }

        }); */

      });
      await this.navController.navigateForward('/tabs/exams');

    })
  }


  async detectProblems() {
    this.suggestedProblems = [];


    const age = await this.calculateAge();
    // Helper to add a problem only if not already present
    const addSuggestedProblem = (id: number, question: any, reponse: any) => {
      if (!this.suggestedProblems.find(problem => problem.id === id)) {
        this.suggestedProblems.push({ id, localisations: { [question]: reponse } });
      }else{
        //update localisation
        const problem = this.suggestedProblems.find(problem => problem.id === id);
        if (problem) {
          problem.localisations[question] = reponse;
        }
      }
    };

    // 1. Vaccination non faite (BCG)
    if (age <= 7 && this.answers['BCG_(tuberculose)'] === 'Non lisible') {
      addSuggestedProblem(1, 'BCG_(tuberculose)', this.answers['BCG_(tuberculose)']);
    }

    // 2. Vaccination non faite (VPO)
    if (age <= 7 && this.answers['VPO_(poliomyélite)'] === 'Non fait') {
      addSuggestedProblem(2, 'VPO_(poliomyélite)', this.answers['VPO_(poliomyélite)']);
    }
    // 3. Vaccination non faite (DTCoq-Hép-B-Hib)
    if (age <= 7 && this.answers['DTCoq-Hép-B-Hib'] === 'Non fait') {
      addSuggestedProblem(3, 'DTCoq-Hép-B-Hib', this.answers['DTCoq-Hép-B-Hib'] );
    }

    // 4. Vaccination non faite (PCV-13_(pneumo))
    if (age <= 7 && this.answers['PCV-13_(pneumo)'] === 'Non fait') {
      addSuggestedProblem(4, 'PCV-13_(pneumo)', this.answers['PCV-13_(pneumo)']);
    }

    // 5. Vaccination non faite (VAR_(rougeole))
    if (age <= 7 && this.answers['VAR_(rougeole)'] === 'Non fait') {
      addSuggestedProblem(5, 'VAR_(rougeole)', this.answers['VAR_(rougeole)']);
    }

    // 6. Vaccination non faite (VAA_(fièvre jaune))
    if (age <= 7 && this.answers['VAA_(fièvre jaune)'] === 'Non fait' ) {
      addSuggestedProblem(6, 'VAA_(fièvre jaune)', this.answers['VAA_(fièvre jaune)']);
    }

    // 7. Vaccination non faite (DTCoq_(diphtérie,_tétanos,_coqueluce))
    if (age > 7 && this.answers['DTCoq_(diphtérie,_tétanos,_coqueluce)'] === 'Non fait') {
      addSuggestedProblem(7, 'DTCoq_(diphtérie,_tétanos,_coqueluce)', this.answers['DTCoq_(diphtérie,_tétanos,_coqueluce)']);
    }
    //8. Déparasitage préventif insuffisant
    if (
      this.answers['Déparasité_?'] === 'Non' ||
      (this.answers['Déparasité_?'] === 'Oui' && this.isDeparasitageOutdated())
    ) {
      addSuggestedProblem(8, 'Déparasité_?', this.answers['Déparasité_?']);
    }

    
    const imcPercent = await this.calculateIMCPercent();
    //9. DIP 1
    if (imcPercent > 80 && imcPercent <= 90) addSuggestedProblem(9, 'Pourcentage IMC', imcPercent);

    //10. DIP 2
    if (imcPercent > 70 && imcPercent <= 80) addSuggestedProblem(10, 'Pourcentage IMC', imcPercent);
    //11. DIP 3
    if (imcPercent <= 70) addSuggestedProblem(11, 'Pourcentage IMC', imcPercent);

    //12. Surcharge pondérale
    const imc = this.calculateIMC();
    if (imcPercent >= 120 ) addSuggestedProblem(12, 'Pourcentage IMC', imcPercent ); // Surcharge pondérale
    if(imc >= 25 && imc < 29.9) addSuggestedProblem(12, 'IMC', imc);

    //13. Obésité
    if (imc > 30) addSuggestedProblem(13, 'IMC', imc); // Obésité

    // 14. Problème d'acuité visuelle
    const testE5d = parseFloat(this.answers['acuite_visuelle_de_loin_droite_sans_correction'] || 0);
    const testE5g = parseFloat(this.answers['acuite_visuelle_de_loin_gauche_sans_correction'] || 0);
    const testE4d = parseFloat(this.answers['acuite_visuelle_de_loin_droite_avec_lunettes'] || 0);
    const testE4g = parseFloat(this.answers['acuite_visuelle_de_loin_gauche_avec_lunettes'] || 0);
    if (this.answers['Test_acuité_visuelle'] === "Avec lunettes") {

      if (age < 7 && (testE4d <= 0.7 || testE4g <= 0.7)) addSuggestedProblem(14, 'Acuité visuelle', this.answers['acuite_visuelle_de_loin_droite_avec_lunettes']);
      if (age >= 7 && (testE4d <= 0.8 || testE4g < 0.8)) addSuggestedProblem(14, 'Acuité visuelle', this.answers['acuite_visuelle_de_loin_droite_avec_lunettes']);
    } else if (this.answers['Test_acuité_visuelle'] === "Sans lunettes") {
      if (age < 7 && (testE5d <= 0.7 || testE5g <= 0.7)) addSuggestedProblem(14, 'Acuité visuelle', this.answers['acuite_visuelle_de_loin_droite_sans_correction']);
      if (age >= 7 && (testE5d <= 0.8 || testE5g < 0.8)) addSuggestedProblem(14, 'Acuité visuelle', this.answers['acuite_visuelle_de_loin_droite_sans_correction']);
    }

    // 15. Problème d'acuité auditive
    if(this.answers['audiometrie_droite_500'] === 'Pas bon') addSuggestedProblem(15, 'audiometrie_droite_500', this.answers['audiometrie_droite_500']);
    if(this.answers['audiometrie_gauche_500'] === 'Pas bon') addSuggestedProblem(15, 'audiometrie_gauche_500', this.answers['audiometrie_gauche_500']);
    if(this.answers['audiometrie_droite_1000'] === 'Pas bon') addSuggestedProblem(15, 'audiometrie_droite_1000', this.answers['audiometrie_droite_1000']);
    if(this.answers['audiometrie_gauche_1000'] === 'Pas bon') addSuggestedProblem(15, 'audiometrie_gauche_1000', this.answers['audiometrie_gauche_1000']);
    if(this.answers['audiometrie_droite_2000'] === 'Pas bon') addSuggestedProblem(15, 'audiometrie_droite_2000', this.answers['audiometrie_droite_2000']);
    if(this.answers['audiometrie_gauche_2000'] === 'Pas bon') addSuggestedProblem(15, 'audiometrie_gauche_2000', this.answers['audiometrie_gauche_2000']);
    if(this.answers['audiometrie_droite_4000'] === 'Pas bon') addSuggestedProblem(15, 'audiometrie_droite_4000', this.answers['audiometrie_droite_4000']);
    if(this.answers['audiometrie_gauche_4000'] === 'Pas bon') addSuggestedProblem(15, 'audiometrie_gauche_4000', this.answers['audiometrie_gauche_4000']);
    

    // 16. Problèmes dentaires mineurs (carie stade 1)
    if(this.answers['Plaque'] === '±' || this.answers['Plaque'] === '+') addSuggestedProblem(16, 'Plaque', this.answers['Plaque']);
    if(this.answers['Tartre'] === '±' || this.answers['Tartre'] === '+') addSuggestedProblem(16, 'Tartre', this.answers['Tartre']);

    // 17. Problèmes dentaires majeurs
    if(this.answers['Plaque'] === '2+' || this.answers['Plaque'] === '3+') addSuggestedProblem(17, 'Plaque', this.answers['Plaque']);
    if(this.answers['Tartre'] === '2+' || this.answers['Tartre'] === '3+') addSuggestedProblem(17, 'Tartre', this.answers['Tartre']);
    if(this.answers['Gingivite'] === '+') addSuggestedProblem(17, 'Gingivite', this.answers['Gingivite']);

    // 18. Caries (Stade 2 à 4)
    if(this.answers['Carie'] === 'Oui' && (this.answers['Si_oui,_stade_carie'] === 'Stade 2' || this.answers['Si_oui,_stade_carie'] === 'Stade 3' || this.answers['Si_oui,_stade_carie'] === 'Stade 4')) addSuggestedProblem(18, 'Carie', this.answers['Si_oui,_stade_carie']);

    // 19. Bouchons de cérumen
    if(this.answers['oreille_droite'] === 'Pathologique') addSuggestedProblem(19, 'oreille_droite', this.answers['oreille_droite']);
    if (this.answers['oreille_gauche'] === 'Pathologique') addSuggestedProblem(19, 'oreille_gauche', this.answers['oreille_gauche']);

    // 20. Infections uro-génitales (év. cfr bandelettes)
    if (this.answers['Problème_urinaire'] === 'Oui') addSuggestedProblem(20, 'Problème_urinaire', this.answers['Problème_urinaire']);

    //21. Mycoses (Peau glabre)
    if ( this.answers['Peau'] === 'Mycose') addSuggestedProblem(21, 'Peau', this.answers['Peau']);


    //22. Mycoses (Cuir chevelu)
    if (this.answers['Cheveux'] === 'Pathologique') addSuggestedProblem(22, 'Cheveux', this.answers['Cheveux']);

    // 23. Mycoses (Orteilles)
    if (this.answers['Orteilles'] === 'Pathologique') addSuggestedProblem(23, 'Orteilles', this.answers['Orteilles']);

    // 24. Mycoses (Ongles)
    if (this.answers['Ongles'] === 'Pathologique') addSuggestedProblem(24, 'Ongles', this.answers['Ongles']);

    //25. Gâle
    if(this.answers['Peau'] === 'Pathologique') addSuggestedProblem(25, 'Peau', this.answers['Peau']);

    // 26. Autres problèmes dermatologiques
    if (this.answers['Peau'] === 'Autres' || this.answers['Si_peau_pathologique,_préciser']) {
      addSuggestedProblem(26, 'Peau', this.answers['Peau']);
    }

    //27. Plaies (coupures, brûlures, etc.)
    if (this.answers['Peau'] === 'Plaie' || this.answers['Peau'] === 'Coupures' || this.answers['Peau'] === 'Brûlures') {
      addSuggestedProblem(27, 'Peau', this.answers['Peau']);
    }

    // 28. Allergies
    if (this.answers['allergies'] === 'Présente') addSuggestedProblem(28, 'allergies', this.answers['allergies']);

    // 29. Infections respiratoires supérieures (exc. rhinite banale) / inf.
    if ( this.answers['poumons'] === 'Pathologique') addSuggestedProblem(29, 'poumons', this.answers['poumons']);

    //30. Hernies
    if ((this.studentGender === 'male' && this.answers['Testicule'] === 'Hernie') || this.answers['Palpation_de_abdomen'] === 'Hernie' || this.answers['region_inguinale'] === 'Hernie') {
       addSuggestedProblem(30, 'Hernie', this.answers['Testicule'] === 'Hernie' ? this.answers['Testicule'] : this.answers['Palpation_de_abdomen'] === 'Hernie' ? this.answers['Palpation_de_abdomen'] : this.answers['region_inguinale']);
    }

    //31. Glucosurie (cfr bandelettes)
    if (this.answers['Glucose'] === '+' || this.answers['Glucose'] === '++' || this.answers['Glucose'] === '+++') {
      addSuggestedProblem(31, 'Glucose', this.answers['Glucose']);
    }

    //32. Problème du système génital
    if(this.studentGender === 'male' && (this.answers['Testicule'] === 'Varicocelle' || this.answers['Testicule'] === 'Absente' )) addSuggestedProblem(32, 'Testicule', this.answers['Testicule']);

    //33. Problème de puberté
    if(this.answers['Interpretation_score_de_tanner'] === 'Pas normal') addSuggestedProblem(33, 'Interpretation_score_de_tanner', this.answers['Interpretation_score_de_tanner']);

    //34. Problème de motricité
    if(this.answers['Demarche'] === 'Pathologique') addSuggestedProblem(34, 'Demarche', this.answers['Demarche']);
    if(this.answers['Equilibre'] === 'Pathologique') addSuggestedProblem(34, 'Equilibre', this.answers['Equilibre']);
    if(this.answers['Bassin'] === 'Pathologique') addSuggestedProblem(34, 'Bassin', this.answers['Bassin']);
    if(this.answers['Membres_inferieurs'] === 'Pathologique') addSuggestedProblem(34, 'Membres_inferieurs', this.answers['Membres_inferieurs']);
    if(this.answers['Membres_supérieurs'] === 'Pathologique') addSuggestedProblem(34, 'Membres_supérieurs', this.answers['Membres_supérieurs']);

    //35. Problème orthopédique
    if(this.answers['Colonne_vertebrale'] === 'Pathologique') addSuggestedProblem(35, 'Colonne_vertebrale', this.answers['Colonne_vertebrale']);
    if(this.answers['Bassin'] === 'Pathologique') addSuggestedProblem(35, 'Bassin', this.answers['Bassin']);
    if(this.answers['Membres_inferieurs'] === 'Pathologique') addSuggestedProblem(35, 'Membres_inferieurs', this.answers['Membres_inferieurs']);
    if(this.answers['Membres_supérieurs'] === 'Pathologique') addSuggestedProblem(35, 'Membres_supérieurs', this.answers['Membres_supérieurs']);

    //36. Problème neurologique
    if((age >= 3 && age <= 7) && this.answers['fine_motricite'] === 'Pas bonne') {
      addSuggestedProblem(36, 'fine_motricite', this.answers['fine_motricite']);
    }
    if((age >= 3 && age <= 7) && this.answers['coordination_des_mouvemments'] === 'Pas bonne') {
      addSuggestedProblem(36, 'coordination_des_mouvemments', this.answers['coordination_des_mouvemments']);
    }
    if((age >= 3 && age <= 7) && this.answers['reflexe'] === 'Pas bon') {
      addSuggestedProblem(36, 'reflexe', this.answers['reflexe']);
    }

    //37. Problème cardiaque
    if(this.answers['Coeur'] === 'Pathologique') addSuggestedProblem(37, 'Coeur', this.answers['Coeur']);
    if(this.answers['Rythme_cardiaque'] === 'Rythme irrégulier') addSuggestedProblem(37, 'Rythme_cardiaque', this.answers['Rythme_cardiaque']);
    if(this.answers['Tension_artérielle'] != 'Normal' ) addSuggestedProblem(37, 'Tension_artérielle', this.answers['Tension_artérielle']);
    if(this.answers['Poumons'] != 'Pathologique'  ) addSuggestedProblem(37, 'Poumons', this.answers['Poumons']);

    //38. Autres problèmes (troubles comportement/langage, dysmorphies, etc.)
    if(this.answers['Comportement'] === 'Pathologie') addSuggestedProblem(38, 'Comportement', this.answers['Comportement']);
    if(this.answers['Language'] === 'Incohérent') addSuggestedProblem(38, 'Language', this.answers['Language']);
    if(this.answers['Dysmorphies'] === 'Oui') addSuggestedProblem(38, 'Dysmorphies', this.answers['Dysmorphies']);

    //39. Problèmes psycho-sociaux graves
    if(this.answers['L\'enfant_vit_bien_à_l\'école'] === 'Non') addSuggestedProblem(39, 'L\'enfant_vit_bien_à_l\'école', this.answers['L\'enfant_vit_bien_à_l\'école']);
    if(this.answers['L\'enfant_vit_bien_à_la_maison'] === 'Non') addSuggestedProblem(39, 'L\'enfant_vit_bien_à_la_maison', this.answers['L\'enfant_vit_bien_à_la_maison']);

   

    this.updateSuggestedProblems(); // Filtrer les suggestions déjà évaluées


    // Pré-remplir selectedProblems avec les suggestions
    //this.selectedProblems = [...this.suggestedProblems];
  }

  // Méthodes utilitaires
  private async calculateIMCPercent(): Promise<number> {
    const poids = parseFloat(this.answers['Poids_(kg)'] || 0);
    const taille = parseFloat(this.answers['Taille_(cm)'] || 0); // Taille en cm

    // poid divisé par le poid ideal * 100
    const poidsIdeal = await this.getPoidIdeal(taille, this.studentGender);
    if (!poidsIdeal) return 0;

    return (poids / poidsIdeal) * 100;
  }

  private async calculateAge(): Promise<number> {
    if (!this.selectedStudent) return 0;

    let students = await this.appStorage.get('students');
    let stdnt = students.find((student: { id: any; }) => student.id == this.selectedStudent);
    if (!stdnt) return 0;
    if (!stdnt.date_of_birth) return 0;
    const birthDate = new Date(stdnt.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }

  private calculateIMC(): number {
    const poids = parseFloat(this.answers['Poids_(kg)'] || 0);
    const taille = parseFloat(this.answers['Taille_(cm)'] || 0) / 100; // Convertir cm en m
    const imc = taille > 0 ? poids / (taille * taille) : 0;

    return Math.round(imc * 100) / 100;
  }

  private isDeparasitageOutdated(): boolean {
    /* const lastDeparasitage = this.answers['Fréquence'];
    if (!lastDeparasitage) return true;
    const diffMonths = (Date.now() - new Date(lastDeparasitage).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return diffMonths > 4; */

    const frequence = this.answers['Fréquence'];
    if (frequence === 'Insuffisant') {
      return true;
    }
    return false;
  }

  private isHearingImpaired(): boolean {
    const seuil = 20; // Exemple de seuil en dB
    return (this.answers['audiometrie_droite'] || 0) < seuil || (this.answers['audiometrie_gauche'] || 0) < seuil;
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

  hasSelectedProblems(): boolean {
    return this.selectedProblems.length > 0;
  }


  readyForNextStep(event: any) {
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

  getProblemLocalisationByID(problem_id: number) {
    const problem = this.suggestedProblems.find(p => p.id === problem_id);
    if (!problem) return null;

    //formater les localisations en string, retirer les espaces en trop et les {}
   let locs = Object.entries(problem.localisations).map(([key, value]) => `${this.formatLabel(key)}: ${value}`).join(', ');


   return locs;

  }

  getProblemLocalisation(problem_id: number) {
    const problem = this.suggestedProblems.find(p => p.id === problem_id);
    if (!problem) return null;

    return problem.localisations ;
  }

  getEvaluationLocalisation(evaluation_id: number) {
    const evaluation = this.evaluations.find(e => e.id === evaluation_id);
    if (!evaluation) return null;

    let locs = Object.entries(evaluation.localisations).map(([key, value]) => `${this.formatLabel(key)}: ${value}`).join(', ');

    return locs;
  }

  /* generateExamId() {

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
  } */

  async generateExamId(): Promise<number> {
    // Générer un ID basé sur le timestamp + une partie aléatoire
    const timestamp = Date.now(); // Timestamp en millisecondes (unique à chaque milliseconde)
    const randomPart = Math.floor(Math.random() * 10000); // Partie aléatoire (0 à 9999)
    let examId = Number(`${timestamp}${randomPart}${this.user.id}`); // Concaténer et convertir en nombre

    // Vérifier si l'ID existe déjà dans le stockage
    const result = await this.appStorage.get('exams');
    if (result) {
      const exams = result.find((exm: any) => exm.id === examId);
      if (exams) {
        // Si l'ID existe déjà, générer un nouvel ID
        return await this.generateExamId(); // Récursion jusqu'à obtenir un ID unique
      }
    }

    return examId; // Retourner l'ID unique
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
    this.detectProblems();
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

  setOpen(isOpen: boolean): void {
    if (isOpen) {
      //this.detectProblems();
    }
    this.isModalOpen = isOpen;
  }


  addProblems(): void {
    if (!this.selectedEvaluation || this.selectedProblems.length === 0) return;

    const newEvaluations = this.selectedProblems.map(problemId => {
      const problem = this.problems.find(p => p.id === problemId);
      return {
        problem_id: problemId,
        problem_name: problem ? problem.name : 'Problème inconnu',
        evaluation: this.selectedEvaluation,
        traitment: this.selectedTraitment,
        conseil: this.selectedConseil,
        raison: this.selectedRaison
      };
    });

    this.evaluations.push(...newEvaluations);
    this.selectedProblems = []; // Réinitialise la sélection
    this.selectedEvaluation = null; // Réinitialise l'évaluation
    this.selectedTraitment = null; // Réinitialise le traitement
    this.selectedConseil = null; // Réinitialise le conseil
    this.selectedRaison = null; // Réinitialise la raison
    this.updateSuggestedProblems();
  }



  // Ignore un problème suggéré
  ignoreSuggestedProblem(problemId: number): void {
    this.suggestedProblems = this.suggestedProblems.filter(problem => problem.id !== problemId);
    delete this.suggestedEvaluations[problemId];
  }

  // Évalue un problème suggéré individuellement
  evaluateSuggestedProblem(problemId: any): void {
    const evaluation = this.suggestedEvaluations[problemId];
    if (!evaluation) return;

    const problem = this.problems.find(p => p.id === problemId);
    if (problem) {
      this.evaluations.push({
        problem_id: problemId,
        problem_name: problem.name,
        evaluation: evaluation,
        traitment: this.selectedTraitment,
        conseil: this.selectedConseil,
        raison: this.selectedRaison,
        localisations: this.getProblemLocalisation(problem.id)
      });

      this.ignoreSuggestedProblem(problemId); // Retirer des suggestions après évaluation
    }

    this.selectedTraitment = null; // Réinitialise le traitement
    this.selectedConseil = null; // Réinitialise le conseil
    this.selectedRaison = null; // Réinitialise la raison
  }

  isInArray(problemId: number): boolean {
    return this.evaluations.some(e => e.problem_id === problemId);
  }

  removeProblem(index: number): void {
    this.evaluations.splice(index, 1);
    this.updateSuggestedProblems();
  }

  private updateSuggestedProblems(): void {
    /* this.suggestedProblems = this.suggestedProblems.filter(id => !this.isInArray(id));
    Object.keys(this.suggestedEvaluations).forEach(id => {
      if (!this.suggestedProblems.includes(Number(id))) {
        delete this.suggestedEvaluations[Number(id)];
      }
    }); */
  }

  getProblemName(problemId: number): string {
    const problem = this.problems.find(p => p.id === problemId);
    return problem ? problem.name : 'Problème inconnu';
  }

  getEvaluationLabel(evaluation: 'to_follow' | 'not_to_follow' | 'attention' | 'identified'): string {
    const labels: { [key in 'to_follow' | 'not_to_follow' | 'attention' | 'identified']: string } = {
      'to_follow': 'À suivre',
      'not_to_follow': 'À ne pas suivre',
      'attention': 'Attention',
      'identified': 'Identifié'
    };
    return labels[evaluation];
  }

  exit() {
    this.selectedStudent = null;
    this.selectedSchool = null;
    this.selectedClasse = null;
    this.navController.navigateForward('/tabs/exams');
  }

  async runTimeChange(event: any) {

    if (event.target.name === 'Taille_(cm)' || event.target.name === 'Poids_(kg)') {
      const tailleStr = this.answers['Taille_(cm)'];
      const poidsStr = this.answers['Poids_(kg)'];

      if (tailleStr && poidsStr) {
        const taille = parseFloat(tailleStr);
        const poids = parseFloat(poidsStr);

        if (isNaN(taille) || isNaN(poids) || taille <= 0 || poids <= 0) {
          const alert = this.alertController.create({
            header: 'Valeurs invalides',
            message: 'La taille et le poids doivent être des nombres positifs.',
            buttons: [{ text: 'Fermer', role: 'cancel', cssClass: 'secondary' }]
          });
          alert.then((al) => al.present());
          return;
        }

        // Calcul de l'IMC
        const tailleM = taille / 100;
        const imc = poids / (tailleM * tailleM);
        this.answers['IMC'] = imc.toFixed(2);

        let poidsIdeal = await this.getPoidIdeal(taille, this.studentGender);

        


        

        const pourcentage = (poids / poidsIdeal) * 100;
        this.answers['Pourcentage'] = pourcentage.toFixed(2);
      }
    } else if (event.target.name === 'Rang_dans_la_fratrie') {

      const rang = parseInt(this.answers['Rang_dans_la_fratrie']);
      const nombreEnfants = parseInt(this.answers['Nombre_enfants_fratrie']);

      if (rang && nombreEnfants && rang > nombreEnfants) {
        console.log('Nombre enfants fratrie:', nombreEnfants);
        const alert = this.alertController.create({
          header: 'Rang supérieur au nombre enfants',
          buttons: [{
            text: 'Fermer',
            role: 'cancel',
            cssClass: 'secondary',
          }]
        });

        alert.then((al) => al.present());
      }
    } else if (event.target.name === 'Nombre_de_filles' || event.target.name === 'Nombre_de_garçons') {
      // Utilisation de !== undefined pour vérifier si le champ a été touché
      const nbFilles = this.answers['Nombre_de_filles'] !== undefined ? parseInt(this.answers['Nombre_de_filles']) : null;
      const nbGarcons = this.answers['Nombre_de_garçons'] !== undefined ? parseInt(this.answers['Nombre_de_garçons']) : null;
      const nbEnfantsFratrie = this.answers['Nombre_enfants_fratrie'] !== undefined ? parseInt(this.answers['Nombre_enfants_fratrie']) : null;

      // Vérification uniquement si les deux champs ont été remplis (peuvent être 0)
      if (nbFilles !== null && nbGarcons !== null && nbEnfantsFratrie !== null) {
        const totalEnfantsSaisi = nbFilles + nbGarcons;

        if (totalEnfantsSaisi !== nbEnfantsFratrie) {
          const alert = this.alertController.create({
            header: 'Nombre total d\'enfants incorrect',
            message: `La somme des filles (${nbFilles}) et garçons (${nbGarcons}) ne correspond pas au total (${nbEnfantsFratrie})`,
            buttons: [{
              text: 'Fermer',
              role: 'cancel',
              cssClass: 'secondary'
            }]
          });

          alert.then((al) => al.present());
        }
      }


    } else if (event.target.name === 'Test_de_la_montre') {
      if (event.target.value === 'Oui') {
        this.answers['Test_du_diapason'] = 'Non';
      } else {
        this.answers['Test_du_diapason'] = 'Oui';
      }
    } else if (event.target.name === 'Test_du_diapason') {
      if (event.target.value === 'Oui') {
        this.answers['Test_de_la_montre'] = 'Non';
      } else {
        this.answers['Test_de_la_montre'] = 'Oui';
      }
    }

  }

  async checkClassesToSync() {
    this.classesToSync = [];
    let classes = await this.appStorage.get('classes') || [];
    if (classes) {
      for (let classe of classes) {
        if (!classe.created_at || classe.status === 'updated' || classe.status === 'deleted') {
          this.classesToSync.push(classe);
        }
      }
    }
  }

  checkStudentsToSync() {
    this.studentsToSync = [];
    this.appStorage.get('students').then((data) => {
      let students = data || [];

      for (let student of students) {
        if (!student.created_at || student.status === 'updated' || student.status === 'deleted') {
          this.studentsToSync.push(student);
        }
      }

    });
  }

  checkSchoolsToSync() {
    this.schools = [];
    this.appStorage.get('schools').then((data) => {
      let schools = data || [];

      for (let school of schools) {
        if (!school.created_at || school.status === "updated" || school.status === "deleted") {
          this.schoolToSync.push(school);
        }
      }

    });
  }

  async storeClassesToAPI() {
    if (this.classesToSync > 0) {
      let counter = 0;
      for (let classe of this.classesToSync) {
        if (!classe.created_at) {
          const classPromise = this.apiService.postClass(classe.school_id, classe);
          const classObservable = await classPromise;
          const cls = await lastValueFrom(classObservable).then((data: any) => {
            counter++;
          });
        }

        if (classe.status === 'updated') {
          const schoolPromise = this.apiService.updateSchool(classe);
          const schoolObservable = await schoolPromise;
          const school = await lastValueFrom(schoolObservable).then((data: any) => {
            counter++;
          });
        }

        if (classe.status === 'deleted') {
          (await this.apiService.deleteSchool(classe.id)).subscribe((data: any) => {
            if (data) {
              counter++;
            }
          });
        }

      }

      if (counter == this.classesToSync.length) {
        this.loadClassesFromAPI().then(() => {
          this.classesToSync = [];
        });
      }
    }

  }


  async storeStudentsToAPI() {

    if (this.studentsToSync > 0) {
      let counter = 0;
      for (let student of this.studentsToSync) {
        if (!student.created_at) {
          const studentPromise = this.apiService.postStudent(student);
          const studentObservable = await studentPromise;
          const std = await lastValueFrom(studentObservable).then((data: any) => {

            if (data) {
              counter++;
              this.loadStudentsFromAPI().then(() => {
                this.storeStudentsHistoryToAPI().then(async () => {
                  let stdsHist: any[] = [];

                  const studentHistoryPromise = this.apiService.getStudentHistory(1);
                  const studentHistoryObservable = await studentHistoryPromise;
                  const studentHistory: any = await lastValueFrom(studentHistoryObservable).then((data: any) => {
                    if (data.data && data.data.length > 0) {
                      for (let hist of data.data) {
                        stdsHist.push(hist);
                      }
                    }

                  });

                  this.appStorage.set('student-history', stdsHist);
                });
              });
            }

          });
        }

        if (student.status === 'updated') {
          const studentPromise = this.apiService.updateStudent(student);
          const studentObservable = await studentPromise;
          const std = await lastValueFrom(studentObservable);
        }

        if (student.status === 'deleted') {
          (await this.apiService.deleteStudent(student.id)).subscribe((data: any) => {
            if (data) {
              console.log(data);
            }
          });
        }

      }
      if (this.studentsToSync.length == counter) {
        this.loadStudentsFromAPI().then(() => {
          //store students history
        });
      }
    }

  }

  async getPoidIdeal(taille: number, gender: string): Promise<number> {
    // Tables associatives pour le poids idéal
    const poidIdealFemale: Record<number, number> = {
      110: 19, 111: 19, 112: 20, 113: 20, 114: 20, 115: 20, 116: 21, 117: 21, 118: 22, 119: 22,
      120: 23, 121: 23, 122: 24, 123: 24, 124: 25, 125: 25, 126: 25, 127: 25, 128: 26, 129: 26,
      130: 27, 131: 27, 132: 29, 133: 29, 134: 30, 135: 30, 136: 31, 137: 31, 138: 32, 139: 32,
      140: 33, 141: 33, 142: 34, 143: 34, 144: 35, 145: 35, 146: 37, 147: 37, 148: 38, 149: 38,
      150: 39, 151: 39, 152: 40, 153: 40, 154: 42, 155: 42, 156: 44, 157: 44, 158: 46, 159: 46,
      160: 50, 161: 50, 162: 53, 163: 53
    };

    const poidIdealMale: Record<number, number> = {
      112: 20, 113: 20, 114: 21, 115: 21, 116: 21, 117: 21, 118: 22, 119: 22, 120: 23, 121: 23,
      122: 24, 123: 24, 124: 25, 125: 25, 126: 25, 127: 25, 128: 26, 129: 26, 130: 27, 131: 27,
      132: 28, 133: 28, 134: 29, 135: 29, 136: 30, 137: 30, 138: 31, 139: 31, 140: 33, 141: 33,
      142: 34, 143: 34, 144: 35, 145: 35, 146: 36, 147: 36, 148: 37, 149: 37, 150: 39, 151: 39,
      152: 40, 153: 40, 154: 41, 155: 41, 156: 43, 157: 43, 158: 45, 159: 45, 160: 47, 161: 47,
      162: 48, 163: 48, 164: 50, 165: 50, 166: 53, 167: 53, 168: 55, 169: 55, 170: 57, 171: 57,
      172: 59, 173: 59, 174: 62, 175: 62
    };

    const poidIdealEnfant: Record<number, number> = {
      85: 12, 86: 12.2, 87: 12.4, 88: 12.6, 89: 12.9, 90: 13.1, 91: 13.3, 92: 13.6, 93: 13.8, 94: 14,
      95: 14.3, 96: 14.5, 97: 14.8, 98: 15, 99: 15.3, 100: 15.6, 101: 15.8, 102: 16.1, 103: 16.4,
      104: 16.7, 105: 16.9, 106: 17.2, 107: 17.5, 108: 17.8, 109: 18.1, 110: 18.4
    };

    let pd = 0;
    if (gender === 'female' && taille > 110) {
      pd = poidIdealFemale[taille] ?? 0;
    } else if (gender === 'male' && taille > 110) {
      pd = poidIdealMale[taille] ?? 0;
    } else {
      pd = poidIdealEnfant[taille] ?? 0;
    }

    return pd;
  }



  async storeExamsToAPI() {

    if (this.examsToSync > 0) {
      let counter = 0;
      for (let exam of this.examsToSync) {
        if (!exam.created_at) {
          const examPromise = this.apiService.postStudentExamination(exam.student_id, exam);
          const examObservable = await examPromise;
          const exm = await lastValueFrom(examObservable).then((data: any) => {
            //console.log(data);
            if (data && data.data) {
              counter++;
            }
          });


        }

        if (exam.status === 'updated') {
          const examPromise = this.apiService.updateExamination(exam.student_id, exam);
          const examObservable = await examPromise;
          const exm = await lastValueFrom(examObservable).then((data: any) => {
            //console.log(data);
            if (data) {
              counter++;
            }
          });
        }

        if (exam.status === 'deleted') {
          const examPromise = this.apiService.deleteExamination(exam.id);
          const examObservable = await examPromise;
          const exm = await lastValueFrom(examObservable).then((data: any) => {
            //console.log(data);
            if (data) {
              counter++;
            }
          });
        }

      }

      //if all exams are synced, sync evaluations
      if (counter == this.examsToSync.length) {
        this.loadExamsFromAPI().then(() => {
          this.storeEvaluationToAPI().then(async () => {
            for (let exam of this.exams) {
              const evalPromise = this.apiService.getEvaluations(exam.id);
              const evalObservable = await evalPromise;
              const ev = await lastValueFrom(evalObservable).then((data: any) => {
                if (data.data && data.data.length > 0) {
                  this.appStorage.set('evaluations', data.data);
                }
              });
            }

          });
        });
      }
    }

  }

  async storeEvaluationToAPI() {
    let evaluations: any[] = await this.appStorage.get('evaluations');
    if (evaluations) {
      for (let evaluation of evaluations) {
        if (!evaluation.created_at) {
          const evaluationPromise = this.apiService.postEvaluation(evaluation.examination_id, evaluation);
          const evaluationObservable = await evaluationPromise;
          const evalu = await lastValueFrom(evaluationObservable).then((data: any) => {
            if (data && data.data) {
              console.log(data);
            }
          });
        }
      }
    }

  }

  async storeStudentsHistoryToAPI() {

    let studentHistory = await this.appStorage.get('student-history');
    if (studentHistory) {
      for (let sth of studentHistory) {
        if (!sth.created_at && !sth.updated_at) {
          const studentHistoryPromise = this.apiService.postStudentHistory(sth); // Stockez la Promise
          const studentHistoryObservable = await studentHistoryPromise; // Récupérez l'Observable
          const stdHistory = await lastValueFrom(studentHistoryObservable);

        }
      }
    }
  }

  async loadExamsFromAPI() {
    let exs: any[] = [];
    let students: any[] = await this.appStorage.get('students');
    for (let student of students) {
      const examsPromise = this.apiService.getStudentExaminations(student.id);
      const examsObservable = await examsPromise;
      const exams: any = await lastValueFrom(examsObservable).then((data: any) => {
        if (data.data && data.data.length > 0) {
          //console.log(data.data);
          for (let exam of data.data) {
            exs.push(exam);

          }
        }

      });
    }



    this.appStorage.set('exams', exs).then(() => {
      this.loadEvaluationsFromAPI();
    });

  }

  async loadEvaluationsFromAPI() {

    let exams: any[] = await this.appStorage.get('exams');
    let evaluations: any[] = [];

    for (let exam of exams) {
      const evaluationsPromise = this.apiService.getEvaluations(exam.id);
      const evaluationsObservable = await evaluationsPromise;
      const evals: any = await lastValueFrom(evaluationsObservable).then((data: any) => {
        if (data.data && data.data.length > 0) {
          for (let evaluation of data.data) {
            evaluations.push(evaluation);
          }
        }
      });
    }

    this.appStorage.set('evaluations', evaluations);

  }

  async loadStudentsFromAPI() {

    let stds: any[] = [];
    let classes: any[] = await this.appStorage.get('classes') || [];
    let stdsHist: any[] = [];
    for (let classe of classes) {
      const studentsPromise = this.apiService.getStudents();
      const studentsObservable = await studentsPromise;
      const students: any = await lastValueFrom(studentsObservable).then((data: any) => {
        if (data.data && data.data.length > 0) {
          for (let student of data.data) {
            if (student.current_class_id == classe.id) {
              stds.push(student);
            }
          }
        }

      });
    }

    this.appStorage.set('students', stds);



  }

  async loadClassesFromAPI() {

    let cls: any[] = [];
    this.appStorage.get('schools').then(async (data) => {

      if (data.length > 0) {
        for (let school of data) {
          const classesPromise = this.apiService.getClasses(school.id);
          const classesObservable = await classesPromise;
          const classes: any = await lastValueFrom(classesObservable).then((data: any) => {
            if (data.data && data.data.length > 0) {
              for (let classe of data.data) {
                cls.push(classe);
              }
            }
          });
        }


        this.classes = cls;
        this.appStorage.set('classes', cls);
      }

    });





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
