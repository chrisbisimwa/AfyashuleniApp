import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { Network, ConnectionStatus } from '@capacitor/network';
import { lastValueFrom } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-sync-data',
  templateUrl: './sync-data.page.html',
  styleUrls: ['./sync-data.page.scss'],
})
export class SyncDataPage implements OnInit {
  loading: HTMLIonLoadingElement | null = null;
  networkStatus: ConnectionStatus;

  classes: any = null;
  classesToSync: any = [];
  schoolToSync: any = [];
  students: any = null;
  studentsToSync: any = [];
  studentsHistoryToSync: any = [];
  evaluations: any = null;
  evaluationsToSync: any = [];
  exams: any = null;
  examsToSync: any = [];
  followUps: any = null;
  followUpsToSync: any = [];
  schools: any = [];
  user: any = null;



  constructor(
    private appStorage: Storage,
    private loadingCtrl: LoadingController,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private toastService: ToastService
  ) {
  }

  ngOnInit() {
    this.refreshData();


    this.checkLogin().then(() => {
      this.checkNetwork().then(() => {
        //this.loadExamsFromAPI();
      });
    });

    this.fetUser();
  }

  ionViewWillEnter() {
    this.refreshData();
  }



  async checkLogin() {
    this.appStorage.get('authToken').then(async token => {
      if (token) {
        //check if the token is still valid
        let tokenData = await this.apiService.checkTokenValidity();
        if (tokenData) {

        } else {
          this.toastService.showError('Votre session a expiré. Veuillez vous reconnecter.');
          this.router.navigate(['/login']);
        }

      } else {
        this.toastService.showError('Vous devez vous connecter pour accéder à cette page.');
        this.router.navigate(['/login']);
        this.router.navigate(['/login']);
      }
    });
  }

  async checkNetwork() {
    if (Network) {
      Network.getStatus().then(status => {
        this.networkStatus = status;
        if (this.networkStatus.connected) {
          //check if there is data to sync
        }


      });

      Network.addListener('networkStatusChange', (status) => {
        this.networkStatus = status;

        if (this.networkStatus.connected) {
          //check if there is data to sync
        }

      });


    }
  }

  loadClassesFromStorage() {
    this.classesToSync = [];
    this.appStorage.get('classes').then((data) => {
      this.classes = data || [];

      for (let classe of this.classes) {
        if (!classe.created_at || classe.status === 'updated' || classe.status === 'deleted') {
          this.classesToSync.push(classe);
        }
      }

    });


  }

  loadStudentsFromStorage() {
    this.studentsToSync = [];
    this.appStorage.get('students').then((data) => {
      this.students = data || [];

      for (let student of this.students) {
        if (!student.created_at || student.status === 'updated' || student.status === 'deleted') {
          this.studentsToSync.push(student);
        }
      }

    });
  }

  loadSchoolsFromStorage() {
    this.schools = [];
    this.appStorage.get('schools').then((data) => {
      this.schools = data || [];

      for (let school of this.schools) {
        if (!school.created_at || school.status === "updated" || school.status === "deleted") {
          this.schoolToSync.push(school);
        }
      }

    });
  }

  loadExamsFromStorage() {
    this.examsToSync = [];
    this.appStorage.get('exams').then((data) => {
      this.exams = data || [];

      for (let exam of this.exams) {
        if (!exam.created_at || exam.status === 'updated' || exam.status === 'deleted') {
          this.examsToSync.push(exam);
        }
      }

    });
  }

  loadEvaluationsFromStorage() {
    this.evaluationsToSync = [];
    this.appStorage.get('evaluations').then((data) => {
      this.evaluations = data || [];

      for (let evaluation of this.evaluations) {
        if (!evaluation.created_at || evaluation.status === 'updated' || evaluation.status === 'deleted') {
          this.evaluationsToSync.push(evaluation);
        }
      }

    });
  }

  loadFollowUpsFromStorage(){
    this.followUpsToSync = [];
    this.appStorage.get('followUps').then((data) => {
      this.followUps = data || [];

      for (let followUp of this.followUps) {
        if (!followUp.created_at || followUp.status === 'updated' || followUp.status === 'deleted') {
          this.followUpsToSync.push(followUp);
        }
      }

    });
  }




  async syncClasses(): Promise<void> {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      loading = await this.presentLoading('Synchronisation des classes en cours...');
      this.networkStatus = await Network.getStatus();
      if (!this.networkStatus.connected) {
        await this.presentAlert('Veuillez vérifier votre connexion internet');
        await this.showToast('Aucune connexion réseau disponible.', 'warning');
        return;
      }

      await this.storeClasses();
      await this.loadClassesFromAPI();
      await this.refreshData();

      await this.showToast('Synchronisation des classes terminée avec succès.', 'success');
    } catch (error) {
      console.error('Erreur inattendue lors de la synchronisation des classes:', error);
      await this.showToast('Erreur lors de la synchronisation des classes.', 'danger');
    } finally {
      if (loading) {
        await this.dismissLoading(loading);
      }
    }
  }

  async storeClasses() {
    for (let classe of this.classesToSync) {
      if (!classe.created_at) {
        const classPromise = this.apiService.postClass(classe.school_id, classe);
        const classObservable = await classPromise;
        const cls = await lastValueFrom(classObservable).then((data: any) => {
          //
        });
      }

      if (classe.status === 'updated') {
        const schoolPromise = this.apiService.updateSchool(classe);
        const schoolObservable = await schoolPromise;
        const school = await lastValueFrom(schoolObservable).then((data: any) => {
          console.log(data.data);
        });
      }

      if (classe.status === 'deleted') {
        (await this.apiService.deleteSchool(classe.id)).subscribe((data: any) => {
          if (data) {
            console.log(data);
          }
        });
      }

    }
  }

  async syncStudents(): Promise<void> {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      loading = await this.presentLoading('Synchronisation des élèves en cours...');
      this.networkStatus = await Network.getStatus();
      if (!this.networkStatus.connected) {
        await this.showToast('Aucune connexion réseau disponible. Synchronisation annulée.', 'warning');
        return;
      }
      if (!Array.isArray(this.studentsToSync) || this.studentsToSync.length === 0) {
        await this.showToast('Aucun étudiant à synchroniser.', 'warning');
        return;
      }
      const syncPromises = this.studentsToSync.map(async (student: any) => {
        try {
          if (!student.created_at) {
            const studentObservable = await this.apiService.postStudent(student);
            const data: any = await lastValueFrom(studentObservable);
            if (data?.data) {
              console.log(`Étudiant créé avec succès:`, data.data);
              await this.loadStudentsFromAPI();
              await this.syncStudentsHistory();
              const studentId = data.data.id;
              const studentHistoryObservable = await this.apiService.getStudentHistory(studentId);
              const historyData: any = await lastValueFrom(studentHistoryObservable);
              const stdsHist: any[] = [];
              if (historyData?.data && Array.isArray(historyData.data) && historyData.data.length > 0) {
                stdsHist.push(...historyData.data);
                console.log(`Historique de l'étudiant ${studentId} récupéré:`, stdsHist);
              } else {
                console.warn(`Aucun historique trouvé pour l'étudiant ${studentId}`);
              }
              await this.appStorage.set('student-history', stdsHist);
              console.log('Historique des étudiants sauvegardé:', stdsHist);

              await this.refreshData();
            } else {
              console.warn('Échec de la création de l\'étudiant, aucune donnée valide:', data);
            }
          }
          if (student.status === 'updated') {
            const studentObservable = await this.apiService.updateStudent(student);
            const data: any = await lastValueFrom(studentObservable);
            console.log(`Étudiant mis à jour avec succès:`, data);
          }
          if (student.status === 'deleted') {
            const deleteObservable = await this.apiService.deleteStudent(student.id);
            const data: any = await lastValueFrom(deleteObservable);
            console.log(`Étudiant supprimé avec succès:`, data);
          }
        } catch (error) {
          console.error(`Erreur lors de la synchronisation de l'étudiant ${student.id || 'nouveau'}:`, error);
        }
      });
      await Promise.all(syncPromises);
      await this.showToast('Synchronisation des étudiants terminée avec succès.', 'success');
      await this.refreshData();
    } catch (error) {
      console.error('Erreur inattendue lors de la synchronisation des étudiants:', error);
      await this.showToast('Erreur lors de la synchronisation des étudiants. Veuillez réessayer.', 'danger');
    } finally {
      if (loading) {
        await this.dismissLoading(loading);
      }
    }
  }

  async syncStudentsHistory(): Promise<void> {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      // Afficher l'indicateur de chargement
      loading = await this.presentLoading('Synchronisation de l\'historique des étudiants...');

      // Vérifier l'état du réseau
      this.networkStatus = await Network.getStatus();
      if (!this.networkStatus.connected) {
        console.warn('Aucune connexion réseau disponible. Synchronisation de l\'historique annulée.');
        return;
      }

      // Récupérer l'historique des étudiants depuis appStorage
      const studentHistory = (await this.appStorage.get('student-history')) || [];
      if (!Array.isArray(studentHistory)) {
        console.warn('L\'historique des étudiants n\'est pas un tableau valide:', studentHistory);
        await this.appStorage.set('student-history', []); // Réinitialiser par sécurité
        return;
      }

      if (studentHistory.length === 0) {
        console.log('Aucun historique d\'étudiant à synchroniser.');
        return;
      }

      // Filtrer les entrées à synchroniser
      const historiesToSync = studentHistory.filter(
        (sth: any) => !sth.created_at && !sth.updated_at
      );

      if (historiesToSync.length === 0) {
        console.log('Aucune entrée d\'historique à synchroniser.');
        return;
      }

      // Paralléliser les requêtes API pour chaque entrée d'historique
      const syncPromises = historiesToSync.map(async (sth: any, index: number) => {
        try {
          const studentHistoryObservable = await this.apiService.postStudentHistory(sth);
          const stdHistory: any = await lastValueFrom(studentHistoryObservable);
          if (stdHistory?.success || stdHistory?.data) { // Vérifier selon la structure de votre API
            console.log(`Historique de l'étudiant ${sth.student_id || index} synchronisé avec succès:`, stdHistory);
            // Marquer l'entrée comme synchronisée (ajouter created_at/updated_at ou la supprimer)
            sth.created_at = new Date().toISOString(); // Exemple
            sth.updated_at = new Date().toISOString(); // Exemple
          } else {
            console.warn(`Échec de la synchronisation de l'historique ${sth.student_id || index}, réponse invalide:`, stdHistory);
          }
        } catch (error) {
          console.error(`Erreur lors de la synchronisation de l'historique ${sth.student_id || index}:`, error);
          // Continuer malgré l'erreur pour ne pas bloquer les autres entrées
        }
      });

      // Attendre que toutes les opérations de synchronisation soient terminées
      await Promise.all(syncPromises);




      console.log('Synchronisation de l\'historique des étudiants terminée avec succès.');
    } catch (error) {
      console.error('Erreur inattendue lors de la synchronisation de l\'historique des étudiants:', error);
      // Afficher une notification à l'utilisateur (facultatif)
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }
  }

  async syncExams(): Promise<void> {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      // Afficher l'indicateur de chargement
      loading = await this.presentLoading('Synchronisation des examens en cours...');

      // Vérifier l'état du réseau
      this.networkStatus = await Network.getStatus();
      if (!this.networkStatus.connected) {
        await this.presentAlert('Veuillez vérifier votre connexion internet');
        return;
      }

      // Vérifier que examsToSync existe et est un tableau
      if (!Array.isArray(this.examsToSync) || this.examsToSync.length === 0) {
        console.warn('Aucun examen à synchroniser.');
        return;
      }

      let counter = 0;
      // Paralléliser les opérations de synchronisation pour chaque examen
      const examSyncPromises = this.examsToSync.map(async (exam: any) => {
        try {
          // Création d'un nouvel examen
          if (!exam.created_at) {
            const examObservable = await this.apiService.postStudentExamination(exam.student_id, exam);
            const data: any = await lastValueFrom(examObservable);
            if (data?.data) {
              console.log(`Examen créé avec succès pour l'étudiant ${exam.student_id}:`, data.data);
              // synchroniser les évaluations correspondantes
              let lastExamId = exam.id
              let newExamId = data.data.id;

              await counter++;

            } else {
              console.warn('Échec de la création de l\'examen, aucune donnée valide:', data);
            }
          }

          // Mise à jour d'un examen existant
          if (exam.status === 'updated') {
            const examObservable = await this.apiService.updateExamination(exam.id, exam);
            const data: any = await lastValueFrom(examObservable);
            if (data) {
              console.log(`Examen mis à jour avec succès pour l'étudiant ${exam.student_id}:`, data);
              counter++;
            } else {
              console.warn('Échec de la mise à jour de l\'examen, aucune donnée valide:', data);
            }
          }

          // Suppression d'un examen
          if (exam.status === 'deleted') {
            const examObservable = await this.apiService.deleteExamination(exam.id);
            const data: any = await lastValueFrom(examObservable);
            if (data) {
              console.log(`Examen supprimé avec succès:`, data);
              counter++;
            } else {
              console.warn('Échec de la suppression de l\'examen, aucune donnée valide:', data);
            }
          }
        } catch (error) {
          console.error(`Erreur lors de la synchronisation de l'examen ${exam.id || 'nouveau'}:`, error);
          // Continuer malgré l'erreur pour ne pas bloquer les autres examens
        }
      });

      // Attendre que toutes les opérations de synchronisation soient terminées
      await Promise.all(examSyncPromises);


      // Si tous les examens sont synchronisés, synchroniser les évaluations
      if (counter === this.examsToSync.length) {
        console.log('Tous les examens ont été synchronisés avec succès. Synchronisation des évaluations...');
        await this.loadExamsFromAPI();
        await this.refreshData();
        await this.loadExamsFromAPI();

        await this.syncEvaluation();

        // Vérifier que exams existe et est un tableau
        if (!Array.isArray(this.exams) || this.exams.length === 0) {
          console.warn('Aucun examen disponible pour récupérer les évaluations.');
          return;
        }

        // Paralléliser la récupération des évaluations pour chaque examen
        const evalPromises = this.exams.map(async (exam: any) => {
          try {
            const evalObservable = await this.apiService.getEvaluations(exam.id);
            const data: any = await lastValueFrom(evalObservable);
            if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
              console.log(`Évaluations récupérées pour l'examen ${exam.id}:`, data.data);
              await this.appStorage.set('evaluations', data.data);
            } else {
              console.warn(`Aucune évaluation trouvée pour l'examen ${exam.id}:`, data);
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération des évaluations pour l'examen ${exam.id}:`, error);
          }
        });

        await Promise.all(evalPromises);
        await this.loadEvaluationsFromAPI();
        await this.refreshData();
        console.log('Récupération des évaluations terminée.');
      } else {
        console.warn(`Seuls ${counter} examens sur ${this.examsToSync.length} ont été synchronisés.`);
      }

      console.log('Synchronisation des examens terminée avec succès.');
    } catch (error) {
      console.error('Erreur inattendue lors de la synchronisation des examens:', error);
    } finally {
      if (loading) {
        await this.dismissLoading(loading);
      }
    }
  }



  async syncEvaluation(): Promise<void> {
    try {
      // Vérifier l'état du réseau
      this.networkStatus = await Network.getStatus();
      if (!this.networkStatus.connected) {
        console.warn('Aucune connexion réseau disponible. Synchronisation des évaluations annulée.');
        return;
      }

      // Récupérer les évaluations depuis appStorage
      const evaluations = (await this.appStorage.get('evaluations')) || [];
      if (!Array.isArray(evaluations)) {
        console.warn('Les évaluations ne sont pas un tableau valide:', evaluations);
        await this.appStorage.set('evaluations', []); // Réinitialiser par sécurité
        return;
      }

      if (evaluations.length === 0) {
        console.log('Aucune évaluation à synchroniser.');
        return;
      }

      // Filtrer les évaluations à synchroniser
      const evaluationsToSync = evaluations.filter(
        (evaluation: any) => !evaluation.created_at
      );

      if (evaluationsToSync.length === 0) {
        console.log('Aucune évaluation à synchroniser.');
        return;
      }

      // Paralléliser les requêtes API pour chaque évaluation
      const syncPromises = evaluationsToSync.map(async (evaluation: any, index: number) => {
        try {
          const evaluationObservable = await this.apiService.postEvaluation(evaluation.examination_id, evaluation);
          console.log(`Synchronisation de l'évaluation ${index} pour l'examen ${evaluation.examination_id}...`);
          const data: any = await lastValueFrom(evaluationObservable);
          if (data?.data) {
            console.log(`Évaluation synchronisée avec succès pour l'examen ${evaluation.examination_id}:`, data.data);
            // Marquer l'évaluation comme synchronisée
          } else {
            console.warn(`Échec de la synchronisation de l'évaluation ${index}, réponse invalide:`, data);
          }
        } catch (error) {
          console.error(`Erreur lors de la synchronisation de l'évaluation ${index}:`, error);
        }
      });

      // Attendre que toutes les opérations de synchronisation soient terminées
      await Promise.all(syncPromises);

      // Mettre à jour les évaluations dans appStorage
      await this.appStorage.set('evaluations', evaluations);
      console.log('Évaluations mises à jour dans le stockage:', evaluations);
      await this.loadEvaluationsFromAPI();
      await this.refreshData();

      console.log('Synchronisation des évaluations terminée avec succès.');
    } catch (error) {
      console.error('Erreur inattendue lors de la synchronisation des évaluations:', error);
    }
  }

  async syncFollowUps(): Promise<void> {
    try{
      // Vérifier l'état du réseau
      this.networkStatus = await Network.getStatus();
      if (!this.networkStatus.connected) {
        console.warn('Aucune connexion réseau disponible. Synchronisation des suivis annulée.');
        return;
      }

      // Récupérer les suivis depuis appStorage
      const followUps = (await this.appStorage.get('followUps')) || [];
      if (!Array.isArray(followUps)) {
        console.warn('Les suivis ne sont pas un tableau valide:', followUps);
        await this.appStorage.set('followUps', []); // Réinitialiser par sécurité
        return;
      }

      if (followUps.length === 0) {
        console.log('Aucun suivi à synchroniser.');
        return;
      }

      // Filtrer les suivis à synchroniser
      const followUpsToSync = followUps.filter(
        (followUp: any) => !followUp.created_at
      );

      if (followUpsToSync.length === 0) {
        console.log('Aucun suivi à synchroniser.');
        return;
      }

      // Paralléliser les requêtes API pour chaque suivi
      const syncPromises = followUpsToSync.map(async (followUp: any, index: number) => {
        try {
          const followUpObservable = await this.apiService.postFollowUp(followUp.problem_id, followUp);
          console.log(`Synchronisation du suivi ${index} pour le problème ${followUp.problem_id}...`);
          const data: any = await lastValueFrom(followUpObservable);
          if (data?.data) {
            console.log(`Suivi synchronisé avec succès pour le problème ${followUp.problem_id}:`, data.data);
            // Marquer le suivi comme synchronisé
          } else {
            console.warn(`Échec de la synchronisation du suivi ${index}, réponse invalide:`, data);
          }
        } catch (error) {
          console.error(`Erreur lors de la synchronisation du suivi ${index}:`, error);
        }
      });

      // Attendre que toutes les opérations de synchronisation soient terminées
      await Promise.all(syncPromises);

      // Mettre à jour les suivis dans appStorage
      await this.appStorage.set('followUps', followUps);
      console.log('Suivis mis à jour dans le stockage:', followUps);
      await this.loadFollowUpsFromAPI();
      await this.refreshData();

      console.log('Synchronisation des suivis terminée avec succès.');
    } catch (error) {
      console.error('Erreur inattendue lors de la synchronisation des suivis:', error);
    }
  }


  async loadClassesFromAPI() {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      // Afficher l'indicateur de chargement
      loading = await this.presentLoading('Chargement des classes en cours...');

      // Récupérer les écoles depuis appStorage
      const schools = (await this.appStorage.get('schools')) || [];
      if (!Array.isArray(schools) || schools.length === 0) {
        console.warn('Aucune école trouvée dans le stockage.');
        this.classes = [];
        await this.appStorage.set('classes', []);
        return;
      }

      // Paralléliser les requêtes API pour toutes les écoles
      const classPromises = schools.map(async (school: any) => {
        try {
          const classesObservable = await this.apiService.getClasses(school.id);
          const data: any = await lastValueFrom(classesObservable);
          if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            console.log(`Classes récupérées pour l'école ${school.id}:`, data.data);
            return data.data; // Retourner les classes
          } else {
            console.warn(`Aucune classe trouvée pour l'école ${school.id}`);
            return [];
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des classes pour l'école ${school.id}:`, error);
          return []; // Retourner un tableau vide en cas d'erreur
        }
      });

      // Attendre que toutes les requêtes soient terminées
      const classesArrays = await Promise.all(classPromises);

      // Aplatir les tableaux de classes en une seule liste
      const cls: any[] = classesArrays.flat();

      // Mettre à jour la propriété classes et sauvegarder dans appStorage
      this.classes = cls;
      await this.appStorage.set('classes', cls);
      console.log('Classes sauvegardées avec succès:', cls);

      // Rafraîchir les données
      await this.refreshData();
    } catch (error) {
      console.error('Erreur lors du chargement des classes depuis l\'API:', error);
      this.classes = [];
      await this.appStorage.set('classes', []); // Sauvegarder un tableau vide en cas d'erreur
      // Afficher une notification à l'utilisateur (facultatif)
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }


  }

  async loadStudentsFromAPI() {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      // Afficher l'indicateur de chargement
      loading = await this.presentLoading('Chargement des élèves en cours...');

      // Récupérer les classes depuis appStorage
      const classes = (await this.appStorage.get('classes')) || [];
      if (!Array.isArray(classes) || classes.length === 0) {
        console.warn('Aucune classe trouvée dans le stockage.');
        await this.appStorage.set('students', []); // Sauvegarder un tableau vide par sécurité
        return;
      }

      // Récupérer tous les étudiants depuis l'API (une seule requête)
      const studentsObservable = await this.apiService.getStudents();
      const data: any = await lastValueFrom(studentsObservable);

      // Vérifier que les données sont valides
      if (!data?.data || !Array.isArray(data.data)) {
        console.warn('Aucune donnée d\'étudiants valide trouvée dans la réponse de l\'API:', data);
        await this.appStorage.set('students', []);
        return;
      }

      // Filtrer les étudiants pour chaque classe
      const stds: any[] = [];
      const allStudents = data.data;

      for (const classe of classes) {
        const classStudents = allStudents.filter(
          (student: any) => student.current_class_id === classe.id
        );
        stds.push(...classStudents);
      }

      // Sauvegarder les étudiants dans appStorage
      await this.appStorage.set('students', stds);
      console.log('Étudiants sauvegardés avec succès:', stds);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants depuis l\'API:', error);
      // Sauvegarder un tableau vide en cas d'erreur pour éviter des problèmes ultérieurs
      await this.appStorage.set('students', []);
      // Afficher une notification à l'utilisateur (facultatif)
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }

  }

  async loadExamsFromAPI() {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      // Afficher l'indicateur de chargement
      loading = await this.presentLoading('Chargement des examens en cours...');

      // Récupérer les étudiants depuis le stockage
      const students = await this.appStorage.get('students');
      if (!students || !Array.isArray(students) || students.length === 0) {
        console.warn('Aucun étudiant trouvé dans le stockage.');
        await this.dismissLoading(loading);
        return;
      }

      // Paralléliser les requêtes API pour tous les étudiants
      const examPromises = students.map(async (student: any) => {
        try {
          const examsObservable = await this.apiService.getStudentExaminations(student.id);
          const data: any = await lastValueFrom(examsObservable);
          if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            console.log(`Examens récupérés pour l'étudiant ${student.id}:`, data.data);
            return data.data; // Retourner les examens
          } else {
            console.warn(`Aucun examen trouvé pour l'étudiant ${student.id}`);
            return [];
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des examens pour l'étudiant ${student.id}:`, error);
          return []; // Retourner un tableau vide en cas d'erreur
        }
      });

      // Attendre que toutes les requêtes soient terminées
      const examsArrays = await Promise.all(examPromises);

      // Aplatir les tableaux d'examens en une seule liste
      const exs: any[] = examsArrays.flat();

      // Sauvegarder les examens dans le stockage
      await this.appStorage.set('exams', exs);
      console.log('Examens sauvegardés avec succès:', exs);

      // Charger les évaluations après avoir sauvegardé les examens
      /* await this.loadEvaluationsFromAPI(); */
    } catch (error) {
      console.error('Erreur lors du chargement des examens depuis le serveur:', error);
      // Afficher une notification à l'utilisateur (facultatif)
      // Vous pouvez utiliser un ToastController pour informer l'utilisateur
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }


  }

  async loadSchoolsFormAPI(){
    let loading: HTMLIonLoadingElement | null = null;
    try{
      loading = await this.presentLoading('Chargement des écoles en cours...');

      // Paralléliser les requêtes API initiales
      const [schoolYearsData, schoolsData, usersData] = await Promise.all([
        this.fetchSchoolYears(),
        this.fetchSchools(),
        this.fetchUsers(),
      ]);

      // Sauvegarder les données dans appStorage
      if (schoolYearsData) {
        await this.appStorage.set('schoolYears', schoolYearsData);
        console.log('Années scolaires sauvegardées:', schoolYearsData);
      }

      if (schoolsData) {
        const filteredSchools = schoolsData.filter((item: any) => item.group_id === this.user.group_id);
        await this.appStorage.set('schools', filteredSchools);
        console.log('Écoles sauvegardées:', filteredSchools);
      }

      if (usersData) {
        await this.appStorage.set('users', usersData);
        console.log('Utilisateurs sauvegardés:', usersData);
      }
    }catch (error) {
      console.error('Erreur lors du chargement des écoles depuis l\'API:', error);
      // Afficher une notification à l'utilisateur (facultatif)
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }

  }

  async loadAllDataFormAPI() {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      loading = await this.presentLoading('Chargement des écoles en cours...');

      // Paralléliser les requêtes API initiales
      const [schoolYearsData, schoolsData, usersData] = await Promise.all([
        this.fetchSchoolYears(),
        this.fetchSchools(),
        this.fetchUsers(),
      ]);

      // Sauvegarder les données dans appStorage
      if (schoolYearsData) {
        await this.appStorage.set('schoolYears', schoolYearsData);
        console.log('Années scolaires sauvegardées:', schoolYearsData);
      }

      if (schoolsData) {
        const filteredSchools = schoolsData.filter((item: any) => item.group_id === this.user.group_id);
        await this.appStorage.set('schools', filteredSchools);
        console.log('Écoles sauvegardées:', filteredSchools);
      }

      

      if (usersData) {
        await this.appStorage.set('users', usersData);
        console.log('Utilisateurs sauvegardés:', usersData);
      }

      // Charger les classes à synchroniser
      await this.loadClassesToSync();

      // Charger les classes depuis l'API si aucune classe à synchroniser
      if (this.classesToSync.length === 0) {
        await this.loadClassesFromAPI();
      }

      // Charger les étudiants à synchroniser
      await this.loadStudentsToSync();

      // Charger les étudiants depuis l'API si aucun étudiant à synchroniser
      if (this.studentsToSync.length === 0) {
        await this.loadStudentsFromAPI();
      }

      //charger les historique des élèves depuis l'API si aucune historique à synchroniser
      if(this.studentsHistoryToSync.length === 0) {
        await this.loadStudentsHistoryFromAPI();
      }

      // Charger les examens à synchroniser
      await this.loadExamsToSync();

      // Charger les examens depuis l'API si aucun examen à synchroniser
      if (this.examsToSync.length === 0) {
        await this.loadExamsFromAPI();
      }

      // charger les évaluations à synchroniser
      await this.loadEvaluationsToSync();

      // Charger les évaluations depuis l'API si aucune évaluation à synchroniser
      if (this.evaluationsToSync.length === 0) {
        await this.loadEvaluationsFromAPI();
      }

      // Charger les problèmes
      await this.loadProblemsFromAPI();

      // Rafraîchir les données
      await this.refreshData();
    } catch (error) {
      console.error('Erreur lors du chargement des écoles depuis l\'API:', error);
      // Afficher une notification à l'utilisateur (facultatif)
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }

  }

  async storeAllDataToAPI(){

    const [ schoolsData, classesData, examData, evaluationData, followUpData ] = await Promise.all([
      this.appStorage.get('schools'),
      this.appStorage.get('classes'),
      this.appStorage.get('exams'),
      this.appStorage.get('evaluations'),
      this.appStorage.get('followUps'),
    ]);


    if(schoolsData){

    }
  }

  async fetchSchools(): Promise<any> {
    try {
      const schoolsObservable = await this.apiService.getSchools();
      const data: any = await lastValueFrom(schoolsObservable);
      return data?.data && Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des écoles:', error);
      return [];
    }
  }

  async fetchUsers(): Promise<any> {
    try {
      const usersObservable = await this.apiService.getUsers();
      const data: any = await lastValueFrom(usersObservable);
      return data?.data && Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  // Charger les classes à synchroniser
  async loadClassesToSync(): Promise<void> {
    this.classesToSync = [];
    this.classes = (await this.appStorage.get('classes')) || [];

    for (const classe of this.classes) {
      if (!classe.created_at || classe.status === 'updated' || classe.status === 'deleted') {
        this.classesToSync.push(classe);
      }
    }
    console.log('Classes à synchroniser:', this.classesToSync);
  }

  // Charger les étudiants à synchroniser
  async loadStudentsToSync(): Promise<void> {
    this.studentsToSync = [];
    this.students = (await this.appStorage.get('students')) || [];

    for (const student of this.students) {
      if (!student.created_at || student.status === 'updated' || student.status === 'deleted') {
        this.studentsToSync.push(student);
      }
    }
    console.log('Étudiants à synchroniser:', this.studentsToSync);
  }

  // Charger les examens à synchroniser
  async loadExamsToSync(): Promise<void> {
    this.examsToSync = [];
    this.exams = (await this.appStorage.get('exams')) || [];

    for (const exam of this.exams) {
      if (!exam.created_at || exam.status === 'updated' || exam.status === 'deleted') {
        this.examsToSync.push(exam);
      }
    }
    console.log('Examens à synchroniser:', this.examsToSync);
  }

  async loadFollowUpsToSync(): Promise<void> {
    this.followUpsToSync = [];
    this.followUps = (await this.appStorage.get('followUps')) || [];

    for (const followUp of this.followUps) {
      if (!followUp.created_at || followUp.status === 'updated' || followUp.status === 'deleted') {
        this.followUpsToSync.push(followUp);
      }
    }
    console.log('Suivis à synchroniser:', this.followUpsToSync);
  }

  // Charger les évaluations à synchroniser
  async loadEvaluationsToSync(): Promise<void> {
    this.evaluationsToSync = [];
    this.evaluations = (await this.appStorage.get('evaluations')) || [];

    for (const evaluation of this.evaluations) {
      if (!evaluation.created_at || evaluation.status === 'updated' || evaluation.status === 'deleted') {
        this.evaluationsToSync.push(evaluation);
      }
    }
    console.log('Évaluations à synchroniser:', this.evaluationsToSync);
  }

  async fetchSchoolYears(): Promise<any> {
    try {
      const schoolYearsObservable = await this.apiService.getSchoolYears();
      const data: any = await lastValueFrom(schoolYearsObservable);
      return data?.data && Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des années scolaires:', error);
      return [];
    }
  }

  async loadEvaluationsFromAPI() {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      // Afficher l'indicateur de chargement
      loading = await this.presentLoading('Chargement des évaluations en cours...');

      // Récupérer les examens depuis le stockage
      const exams = await this.appStorage.get('exams');
      if (!exams || !Array.isArray(exams) || exams.length === 0) {
        console.warn('Aucun examen trouvé dans le stockage.');
        return; // Sortir de la fonction si aucun examen
      }

      // Paralléliser les requêtes API pour tous les examens
      const evaluationPromises = exams.map(async (exam: any) => {
        try {
          const evaluationsObservable = await this.apiService.getEvaluations(exam.id);
          const data: any = await lastValueFrom(evaluationsObservable);
          if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            console.log(`Évaluations récupérées pour l'examen ${exam.id}:`, data.data);
            return data.data; // Retourner les évaluations
          } else {
            console.warn(`Aucune évaluation trouvée pour l'examen ${exam.id}`);
            return [];
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des évaluations pour l'examen ${exam.id}:`, error);
          return []; // Retourner un tableau vide en cas d'erreur
        }
      });

      // Attendre que toutes les requêtes soient terminées
      const evaluationsArrays = await Promise.all(evaluationPromises);

      // Aplatir les tableaux d'évaluations en une seule liste
      const evaluations: any[] = evaluationsArrays.flat();

      // Sauvegarder les évaluations dans le stockage
      await this.appStorage.set('evaluations', evaluations);
      console.log('Évaluations sauvegardées avec succès:', evaluations);
    } catch (error) {
      console.error('Erreur lors du chargement des évaluations depuis l\'API:', error);
      // Afficher une notification à l'utilisateur (facultatif)
      // Vous pouvez utiliser un ToastController pour informer l'utilisateur
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }

  }

  async loadFollowUpsFromAPI(){
    let loading: HTMLIonLoadingElement | null = null;
    try {
      // Afficher l'indicateur de chargement
      loading = await this.presentLoading('Chargement des suivis en cours...');

      // Récupérer les suivis depuis le stockage
      const problems = await this.appStorage.get('problems');
      if (!problems || !Array.isArray(problems) || problems.length === 0) {
        console.warn('Aucun problème trouvé dans le stockage.');
        return; // Sortir de la fonction si aucun problème
      }

      // Paralléliser les requêtes API pour tous les suivis
      const followUpPromises = problems.map(async (problem: any) => {
        try {
          const followUpObservable = await this.apiService.getFollowUps(problem.id);
          const data: any = await lastValueFrom(followUpObservable);
          if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            console.log(`Suivis récupérés pour le problème ${problem.id}:`, data.data);
            return data.data; // Retourner les suivis
          } else {
            console.warn(`Aucun suivi trouvé pour le problème ${problem.id}`);
            return [];
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des suivis pour le problème ${problem.id}:`, error);
          return []; // Retourner un tableau vide en cas d'erreur
        }
      });

      // Attendre que toutes les requêtes soient terminées
      const followUpArrays = await Promise.all(followUpPromises);

      // Aplatir les tableaux de suivis en une seule liste
      const followUps: any[] = followUpArrays.flat();

      // Sauvegarder les suivis dans le stockage
      await this.appStorage.set('followUps', followUps);
      console.log('Suivis sauvegardés avec succès:', followUps);
    } catch (error) {
      console.error('Erreur lors du chargement des suivis depuis l\'API:', error);
      // Sauvegarder un tableau vide en cas d'erreur pour éviter des problèmes ultérieurs
      await this.appStorage.set('followUps', []);
      // Afficher une notification à l'utilisateur (facultatif)
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }

  }

  async loadProblemsFromAPI() {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      // Afficher l'indicateur de chargement
      loading = await this.presentLoading('Chargement des problèmes en cours...');

      // Récupérer les problèmes depuis l'API
      const problemsObservable = await this.apiService.getProblems();
      const data: any = await lastValueFrom(problemsObservable);

      // Vérifier que les données sont valides
      if (data?.data && Array.isArray(data.data)) {
        // Sauvegarder les problèmes dans appStorage
        await this.appStorage.set('problems', data.data);
        console.log('Problèmes sauvegardés avec succès:', data.data);
      } else {
        console.warn('Aucune donnée de problèmes valide trouvée dans la réponse de l\'API:', data);
        await this.appStorage.set('problems', []); // Sauvegarder un tableau vide par sécurité
      }
    } catch (error) {
      console.error('Erreur lors du chargement des problèmes depuis l\'API:', error);
      // Sauvegarder un tableau vide en cas d'erreur pour éviter des problèmes ultérieurs
      await this.appStorage.set('problems', []);
      // Afficher une notification à l'utilisateur (facultatif)
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }
  }

  async loadStudentsHistoryFromAPI(){
    let loading: HTMLIonLoadingElement | null = null;
    try {
      // Afficher l'indicateur de chargement
      loading = await this.presentLoading('Chargement de l\'historique des élèves en cours...');

      // Récupérer les écoles depuis l'API
      const schoolYears = await this.appStorage.get('schoolYears');
      if (!schoolYears || !Array.isArray(schoolYears) || schoolYears.length === 0) {
        console.warn('Aucune année scolaire trouvée dans le stockage.');
        await this.appStorage.set('studentsHistory', []);
        return;
      }

      // Paralléliser les requêtes API pour tous les historiques
      const studentsHistoryPromises = schoolYears.map(async (schoolYear: any) => {
        try {
          const studentsHistoryObservable = await this.apiService.getStudentHistory(schoolYear.id);
          const data: any= await lastValueFrom(studentsHistoryObservable);
          if(data?.data && Array.isArray(data.data) && data.data.length > 0){
            console.log(`Historique des élèves récupéré pour l'année scolaire ${schoolYear.id}:`, data.data);
            return data.data;
          }else{
            console.warn(`Aucun historique des élèves trouvé pour l'année scolaire ${schoolYear.id}.`);
            return [];
          }
        } catch (error) {
          console.error(`Erreur lors du chargement de l'historique des élèves pour l'année scolaire ${schoolYear.id}:`, error);
          return [];
        }
      });

    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des élèves depuis l\'API:', error);
      // Sauvegarder un tableau vide en cas d'erreur pour éviter des problèmes ultérieurs
      await this.appStorage.set('studentsHistory', []);
      // Afficher une notification à l'utilisateur (facultatif)
    } finally {
      // S'assurer que l'indicateur de chargement est toujours fermé, même en cas d'erreur
      if (loading) {
        await this.dismissLoading(loading);
      }
    }
  }

  async refreshData() {
    try {
      // Charger les écoles depuis le stockage
      try {
        await this.loadSchoolsFromStorage();
      } catch (error) {
        console.error('Échec du chargement des écoles:', error);
        // Continuer malgré l'erreur pour ne pas bloquer le reste
      }

      // Charger les classes depuis le stockage
      try {
        await this.loadClassesFromStorage();
      } catch (error) {
        console.error('Échec du chargement des classes:', error);
        // Continuer malgré l'erreur
      }

      // Charger les étudiants depuis le stockage
      try {
        await this.loadStudentsFromStorage();
      } catch (error) {
        console.error('Échec du chargement des étudiants:', error);
        // Continuer malgré l'erreur
      }

      // Charger les examens depuis le stockage
      try {
        await this.loadExamsFromStorage();
      } catch (error) {
        console.error('Échec du chargement des examens:', error);
        // Continuer malgré l'erreur
      }

      //charger les évaluations depuis le stockage
      try {
        await this.loadEvaluationsFromStorage();
      } catch (error) {
        console.error('Échec du chargement des évaluations:', error);
        // Continuer malgré l'erreur
      }

      //charger les suivi depuis le stockage
      try{
        await this.loadFollowUpsFromStorage();
      } catch (error) {
        console.error('Échec du chargement des suivis:', error);
        // Continuer malgré l'erreur
      }



      console.log('Rafraîchissement des données terminé avec succès.');
    } catch (error) {
      console.error('Erreur inattendue lors du rafraîchissement des données:', error);
      // Afficher une notification à l'utilisateur (facultatif)
    }


  }

  async fetUser() {
    this.appStorage.get('user').then((val) => {
      this.user = val;
    });
  }

  /* async presentLoading(msg: string) {
    this.loading = await this.loadingCtrl.create({
      message: msg,
      duration: 5000,
    });

    this.loading.present();
  } */

  async presentLoading(message: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent',
    });
    await loading.present();
    return loading;
  }

  async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }


  /* async dismissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  } */

  async dismissLoading(loading: HTMLIonLoadingElement | null): Promise<void> {
    if (loading) {
      await loading.dismiss();
    }
  }

  handleRefresh(event: any) {
    this.refreshData();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  previousState() {
    this.router.navigate(['/tabs/account']);
  }

}
