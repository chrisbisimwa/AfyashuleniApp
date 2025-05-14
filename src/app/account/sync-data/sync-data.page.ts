import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { Network, ConnectionStatus } from '@capacitor/network';
import { lastValueFrom } from 'rxjs';

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
  evaluations: any = null;
  evaluationsToSync: any = [];
  exams: any = null;
  examsToSync: any = [];
  schools: any = [];
  user: any = null;



  constructor(
    private appStorage: Storage,
    private loadingCtrl: LoadingController,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController
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



  async checkLogin() {
    this.appStorage.get('authToken').then(async token => {
      if (token) {
        //check if the token is still valid
        let tokenData = await this.apiService.checkTokenValidity();
        if (tokenData) {

        } else {
          this.router.navigate(['/login']);
        }

      } else {
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





  syncClasses() {
    this.presentLoading('Synchronisation des classes en cours...');
    setTimeout(() => {
      //this.dismissLoading();
    }, 60000);


    Network.getStatus().then(async status => {
      this.networkStatus = status;
      if (this.networkStatus.connected) {
        this.storeClasses().then(() => {
          console.log('Classes synchronisées');
          this.loadClassesFromAPI();
        });
      } else {
        this.presentAlert('Veuillez vérifier votre connexion internet');
      }
    });
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

  syncStudents() {
    this.presentLoading('Synchronisation des élèves en cours...');
    setTimeout(() => {
      //this.dismissLoading();
    }, 60000);


    Network.getStatus().then(async status => {
      this.networkStatus = status;
      if (this.networkStatus.connected) {
        for (let student of this.studentsToSync) {
          if (!student.created_at) {
            const studentPromise = this.apiService.postStudent(student);
            const studentObservable = await studentPromise;
            const std = await lastValueFrom(studentObservable).then((data: any) => {
              if (data && data.data) {
                this.loadStudentsFromAPI().then(() => {
                  this.syncStudentsHistory().then(async () => {
                    let stdsHist: any[] = [];
                    /* let classes: any[] = await this.appStorage.get('classes');
                    let stdsHist: any[] = [];
                    let classId = student.current_class_id;
                    if (classId) {
                      if (classes) {
                        let schoolYearId = classes.find((item: any) => item.id === classId).schoolYear_id;
                        if (schoolYearId) {
                          const studentHistPromise = this.apiService.getStudentHistory(schoolYearId);
                          const studentHistObservable = await studentHistPromise;
                          const studentHist: any = await lastValueFrom(studentHistObservable).then((data: any) => {
                            if (data.data && data.data.length > 0) {
                              for (let hist of data.data) {
                                stdsHist.push(hist);
                              }
                            }

                          });
                        }
                      }

                    } */

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
      }
    });
  }

  async syncStudentsHistory() {

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

  syncExams() {
    this.presentLoading('Synchronisation des examens en cours...');
    setTimeout(() => {
      //this.dismissLoading();
    }, 60000);


    Network.getStatus().then(async status => {
      this.networkStatus = status;
      if (this.networkStatus.connected) {
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
            const examPromise = this.apiService.updateStudentExamination(exam.student_id, exam);
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
            this.syncEvaluation().then(async () => {
              for (let exam of this.exams) {
                const evalPromise = this.apiService.getEvaluations(exam.id);
                const evalObservable = await evalPromise;
                const ev = await lastValueFrom(evalObservable).then((data: any) => {
                  if (data.data && data.data.length > 0) {
                    this.appStorage.set('evaluations', data.data);
                  }
                });
              }
              //this.dismissLoading();
            });
          });
        }



      } else {
        this.presentAlert('Veuillez vérifier votre connexion internet');
      }

    });
  }

  async syncEvaluation() {
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
        await this.loadEvaluationsFromAPI(); // Continuer même si aucun étudiant
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
      await this.loadEvaluationsFromAPI();
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

  async loadSchoolsFormAPI() {
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
