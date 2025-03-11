import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute, Router } from '@angular/router';

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
  schoolYears: any[] = [];
  schools: any[] = [];
  classes: any[] = [];
  students: any[] = [];
  problems: any[] = [];
  evaluations: any[] = [];
  user: any;
  userRoles: String[] = [];
  isReadyToSave: boolean = false; isResolved: boolean = false;
  selectedProblem: number = 0;
  addedProblems: any[] = [];
  selectedEvaluation: string = "";
  isModalOpen = false;

  constructor(private appStorage: Storage, private route: ActivatedRoute, private router: Router) {
    this.fetchUser().then(() => {
      this.fetchRoles().then(() => {
        
      });
    });
   }

  ngOnInit() {
    this.fetchSchoolYears();

    this.fetchSchools(null).then(() => {
      if (this.route.snapshot.params['id']) {
        this.loadStudent();
      }
    });




  }

  async loadStudent() {
    let students = await this.appStorage.get('students');
    let stdnt = students.find((student: { id: any; }) => student.id == this.route.snapshot.params['id']);
    if (stdnt) {
      

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

  async fetchSchoolYears() {
    //fetch school years from local storage
    const schoolYears = await this.appStorage.get('schoolYears');
    this.schoolYears = schoolYears || [];
  }

  readyForNexStep(event: any) {
    if (event.target.value) {
      let stdnt = this.students.find((s: { id: any }) => s.id === event.target.value);
      if (stdnt) {
        if (this.userRoles.includes('infirmier')) {
        } else if (this.userRoles.includes('Medecin')) {
        }
      }



    }
  }

  async fetchSchools(event: any) {
    //fetch schools from local storage based on selected school year
    const result = await this.appStorage.get('schools');
   

    let schools = result.filter((item: any) => item.status !== 'deleted' && item.group_id == this.user.group_id) || [];

    

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

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  getProblemNameById(problem_id: number) {
    const problem = this.problems.find(p => p.id === problem_id);

    return problem.name;
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

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isInArray(problemId: number): boolean {
    return this.evaluations.find(e => e.problem_id === problemId) !== undefined;
  }

  async fetchUser() {
    this.user = await this.appStorage.get('user') || {};
    return this.user;
  }

  async fetchRoles() {
    this.userRoles = await this.appStorage.get('roles') || [];

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

  previousState(){
    this.router.navigate(['/tabs/followup']);
  }

}
