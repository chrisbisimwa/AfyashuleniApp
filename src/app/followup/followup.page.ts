import { Component, OnInit } from '@angular/core';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
interface Evaluation {
  id: number;
  problem_id: number;
  examination_id: number;
  status?: 'to_follow' | 'not_to_follow' | 'attention' | null;
}

interface ProblemFollowUp {
  id: number;
  student_id: number;
  date: string;
  doctor_id: number;
  problem_id: number;
  followup_status?: 'fully_solved' | 'partially_solved' | 'not_solved' | null;
}

interface Problem {
  id: number;
  name: string;
}

interface Examination {
  id: number;
  student_id: number;
  date: string;
  evaluations: Evaluation[];
}

@Component({
  selector: 'app-followup',
  templateUrl: './followup.page.html',
  styleUrls: ['./followup.page.scss'],
})
export class FollowupPage implements OnInit {
  followups: any[] = [];

  schools: any[] = [];
  classes: any[] = [];
  students: any[] = [];
  selectedSchool: number | null = null;
  selectedClasse: number | null = null;
  selectedStudent: any = null;
  filteredStudents: any[] = []; // Liste des élèves filtrés
  searchQuery: string = ''; // Requête de recherche
  problems: any[] = [];
  evaluations: (Evaluation & { examDate: string; problemName: string })[] = [];
  followUps: ProblemFollowUp[] = [];
  followUpStatuses: { [key: number]: 'fully_solved' | 'partially_solved' | 'not_solved' | null } = {};
  doctorId: number = 1; // ID du médecin connecté (à remplacer par une vraie valeur)

  constructor(
    private navController: NavController,
    public plt: Platform,
    private toastController: ToastController,
    private appStorage: Storage
  ) { }

  async ngOnInit() {
    this.loadSchools();
    this.problems = (await this.appStorage.get('problems')) || [];
  }

  ionViewWillEnter() {
    this.resetForm();
  }

  // Charger les écoles
  async loadSchools() {
    const result = await this.appStorage.get("schools");
    
    if (result) {
      this.schools = result.filter((item:any) => item.status !== 'deleted');
    }
  }

   // Charger les classes d'une école
   async fetchClasses(event: any) {
    const schoolId = event.detail.value;
    this.selectedSchool = schoolId;
    this.classes = [];
    this.students = [];
    this.selectedClasse = null;
    this.selectedStudent = null;
    this.evaluations = [];

    const result = await this.appStorage.get('classes');
    if (result) {
      this.classes = result.filter((classs: any) => classs.school_id == schoolId && classs.status !== 'deleted');
    }
  }

  // Charger les élèves d'une classe ayant des problèmes identifiés
  async fetchStudents(event: any) {
    
    const classeId = event.detail.value;
    this.selectedClasse = classeId;
    this.students = [];
    this.selectedStudent = null;
    this.evaluations = [];

    // Récupérer les élèves ayant des problèmes identifiés il y a environ 6 mois

    const result = await this.appStorage.get('students');
    if (result) {
      const stdnts = result.filter((student: any) => student.current_class_id == classeId && student.status != 'deleted');
      // Filtrer les élèves ayant des problèmes identifiés
      this.students = stdnts.filter((student: any) => this.hasProblems(student));
      this.filteredStudents = [...this.students]; // Initialiser la liste filtrée avec tous les
    }
  }

  // Vérifier si l'élève a des problèmes identifiés
  async hasProblems(student: any): Promise<boolean> {
    // Vérifie localement si l'élève possède des examens avec au moins une évaluation
    let exams = (await this.appStorage.get('exams')) || [];
    exams = exams.filter((exam: Examination) => exam.student_id === student.id);
    if (exams.length === 0) return false;
    let evaluations = (await this.appStorage.get('evaluations')) || [];
    evaluations = evaluations.filter((evaluation: Evaluation) => exams.some((exam: Examination) => exam.id === evaluation.examination_id));
    
    if (evaluations.length === 0) return false;
    return true;
  }

  // Filtrer les élèves en fonction de la requête de recherche
  filterStudents() {
    if (!this.searchQuery.trim()) {
      this.filteredStudents = [...this.students];
      return;
    }

    const query = this.searchQuery.trim().toLowerCase();
    this.filteredStudents = this.students.filter(student =>
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(query)
    );
  }

  // Sélectionner un élève à partir de la liste filtrée
  selectStudent(student: any) {
    this.selectedStudent = student;
    this.loadStudentEvaluationsForId(student.id);
  }

  // Charger les évaluations pour un élève donné
  async loadStudentEvaluationsForId(studentId: number) {
    this.evaluations = [];
    this.followUps = [];
    this.followUpStatuses = {};

    try {

        let stdExams = (await this.appStorage.get('exams')) || [];
        stdExams = stdExams.filter((exam: Examination) => exam.student_id === Number(studentId));
        let stdEvaluations =  (await this.appStorage.get('evaluations')) || [];

        stdEvaluations = stdEvaluations.filter((evaluation: Evaluation) =>
          stdExams.some((exam: Examination) => exam.id === evaluation.examination_id)
        );
        this.evaluations = stdEvaluations.map((evaluation: Evaluation) => ({
          ...evaluation,
          examDate: stdExams.find((exam: Examination) => exam.id === evaluation.examination_id)?.date || '',
          problemName: this.getProblemName(evaluation.problem_id),
        }));

        

      const followUps: ProblemFollowUp[] | null = await this.appStorage.get('followUps');
      if (followUps) {
        this.followUps = followUps.filter((f: ProblemFollowUp) => f.student_id === Number(studentId));
        this.evaluations.forEach((evaluation, index) => {
          const existingFollowUp = this.followUps.find(f => f.problem_id === evaluation.problem_id);
          this.followUpStatuses[index] = existingFollowUp?.followup_status || null;
        });
      } else {
        console.warn('Aucun suivi trouvé dans le stockage.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de suivi :', error);
      const toast = await this.toastController.create({
        message: 'Erreur lors du chargement des données. Veuillez réessayer.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  // Charger les problèmes de l'élève sélectionné
  async loadStudentEvaluations(event: any) {
    const studentId = event.detail.value;
    this.selectedStudent = this.students.find(s => s.id === studentId);
    this.evaluations = [];
    this.followUps = [];
    this.followUpStatuses = {};

    try {
      const exams: Examination[] | null = await this.appStorage.get('exams');
      if (exams) {
        const stdExams = exams.filter((exam: Examination) => exam.student_id === Number(studentId));
        let allEvaluations: (Evaluation & { examDate: string; problemName: string })[] = stdExams
          .map((exam: Examination) =>
            exam.evaluations.map((evaluation: Evaluation) => ({
              ...evaluation,
              examDate: exam.date,
              problemName: this.getProblemName(evaluation.problem_id),
            }))
          )
          .flat();

        allEvaluations.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
        const seenProblems = new Set<number>();
        this.evaluations = allEvaluations.filter(evaluation => {
          if (seenProblems.has(evaluation.problem_id)) return false;
          seenProblems.add(evaluation.problem_id);
          return true;
        });
      } else {
        console.warn('Aucun examen trouvé dans le stockage.');
      }

      const followUps: ProblemFollowUp[] | null = await this.appStorage.get('followUps');
      if (followUps) {
        this.followUps = followUps.filter((f: ProblemFollowUp) => f.student_id === Number(studentId));
        this.evaluations.forEach((evaluation, index) => {
          const existingFollowUp = this.followUps.find(f => f.problem_id === evaluation.problem_id);
          this.followUpStatuses[index] = existingFollowUp?.followup_status || null;
        });
      } else {
        console.warn('Aucun suivi trouvé dans le stockage.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de suivi :', error);
      const toast = await this.toastController.create({
        message: 'Erreur lors du chargement des données. Veuillez réessayer.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  // Mettre à jour le statut de suivi d'un problème
  updateFollowUpStatus(index: number, status: 'fully_solved' | 'partially_solved' | 'not_solved') {
    this.followUpStatuses[index] = status;
  }

  async saveFollowUp() {
    if (Object.values(this.followUpStatuses).some(status => !status)) {
      const toast = await this.toastController.create({
        message: 'Veuillez remplir tous les statuts de suivi',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const followUpsToSave: ProblemFollowUp[] = this.evaluations.map((evaluation, index) => {
      const existingFollowUp = this.followUps.find(f => f.problem_id === evaluation.problem_id);
      return {
        id: existingFollowUp?.id || 0,
        student_id: this.selectedStudent.id,
        date: new Date().toISOString(),
        doctor_id: this.doctorId,
        problem_id: evaluation.problem_id,
        followup_status: this.followUpStatuses[index],
      };
    });

    try {
      let existingFollowUps: ProblemFollowUp[] = (await this.appStorage.get('followUps')) || [];
      followUpsToSave.forEach(followUp => {
        const existing = existingFollowUps.find(f => f.id === followUp.id);
        if (existing) {
          Object.assign(existing, followUp);
        } else {
          followUp.id = existingFollowUps.length ? Math.max(...existingFollowUps.map(f => f.id)) + 1 : 1;
          existingFollowUps.push(followUp);
        }
      });
      await this.appStorage.set('followUps', existingFollowUps);

      const toast = await this.toastController.create({
        message: 'Suivi enregistré avec succès',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
      this.resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des suivis :', error);
      const toast = await this.toastController.create({
        message: 'Erreur lors de l\'enregistrement du suivi',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }


  resetForm() {
    this.selectedSchool = null;
    this.selectedClasse = null;
    this.selectedStudent = null;
    this.classes = [];
    this.students = [];
    this.evaluations = [];
    this.followUps = [];
    this.followUpStatuses = {};
  }

  getProblemName(problemId: number): string {
    const problem = this.problems.find(p => p.id === problemId);
    return problem ? problem.name : 'Problème inconnu';
  }

  getEvaluationLabel(status: 'to_follow' | 'not_to_follow' | 'attention' | null | undefined): string {
    const labels = {
      'to_follow': 'À suivre',
      'not_to_follow': 'À ne pas suivre',
      'attention': 'Attention',
    };
    return status ? labels[status] || status : 'Non spécifié';
  }


  getFollowUpStatusLabel(status: string | null): string {
    const labels: { [key: string]: string } = {
      'fully_solved': 'Solutionné',
      'partially_solved': 'Partiellement solutionné',
      'not_solved': 'Non solutionné',
    };
    return status ? labels[status] || 'Statut inconnu' : 'Non suivi';
  }



  // Vérifier si l'élève a un examen datant d'environ 6 mois
  hasExamWithinSixMonths(student: any): boolean {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const threeMonthsRange = new Date(sixMonthsAgo);
    threeMonthsRange.setMonth(sixMonthsAgo.getMonth() - 3); // Plage de 3 à 9 mois

    return student.exams?.some((exam: any) => {
      const examDate = new Date(exam.examDate);
      return examDate >= threeMonthsRange && examDate <= sixMonthsAgo && exam.evaluations?.length > 0;
    });
  }

  /* fetchFollowups(refresher?: any, user?: any){

  }

  search(query: any, refresher?: any) {

  }

  async view(followupId: any) {
    //console.log('examId', examId);
    await this.navController.navigateForward('/tabs/followup/' + followupId + '/view');

  }

  async new(){
    await this.navController.navigateForward('/tabs/followup/new');
  }

  edit(item: IonItemSliding, site: any){

  }

  delete( customer: any){

  }
 */
}
