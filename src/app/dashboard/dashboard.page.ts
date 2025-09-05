import { Component, ViewChild } from '@angular/core';

import { ChartConfiguration, ChartOptions } from 'chart.js';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';
import { Chart } from 'chart.js/auto';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardPage {
  @ViewChild('lineCanvas') lineCanvas: any;
  lineChart: any;
  user: any = {};
  roles: String[] = [];
  totalStudents: number = 0;
  totalRedoublants: number = 0;
  totalToExamine: number = 0;
  totalExaminations: number = 0;



  constructor(
    private appStorage: Storage
  ) {

  }

  async ngOnInit() {
    await this.fetchUser();
    await this.fetchRoles();
    await this.createLineChart();
    await this.calculateTotalStudents();
    this.totalToExamine = await this.totalStudents-this.totalRedoublants;
    await this.calculateTotalExaminations();
  }

  async fetchUser() {
    this.appStorage.get('user').then((val) => {
      this.user = val;
    });
  }

  async fetchRoles() {
    this.roles = await this.appStorage.get('roles');
  }

  async ionViewDidEnter() {
    await this.fetchUser();
    await this.fetchRoles();
    await this.createLineChart();


  }

  new() {
    console.log('new');
  }

  async createLineChart() {

    const exams = await this.appStorage.get('exams');

    let labels = [];
    let data = [];

    const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = new Date().getMonth();
    let start = 0;
    if ((month - 5) >= 0) {
      start = month - 5;
    } else {
      start = 0;
    }

    for (let i = start; i <= month; i++) {
      labels.push(months[i]);
    }

    for (let mt of months) {
      let f = 0;
      for (let exam of exams) {
        if (this.roles.includes('infirmier')) {
          if (exam.examiner_id == this.user.id) {

            if (mt === new Date(exam.date).toLocaleString('en-fr', { month: 'short' })) {
              f++;
            }
          }
        }
        if (this.roles.includes('Medecin')) {
          if (exam.doctor_id == this.user.id) {

            if (mt === new Date(exam.date).toLocaleString('en-fr', { month: 'short' })) {
              f++;
            }
          }
        }
      }

      if (labels.indexOf(mt) >= 0) {
        data[labels.indexOf(mt)] = f;
      }

    }

    //count user examinations by month name

    /* for (let month of months) {
      let count = 0;
      for (let exam of exams) {
        if (exam.user_id == user.id) {
          if (exam.created_at.includes(month)) {
            count++;
          }
        }
      }
      labels.push(month);
      data.push(count);
    } */




    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line', // Type du graphique
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Examinations',
            data: data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      },
    });
  }


  loadChartData() {

  }

  async calculateTotalStudents(){
    const classes = await this.appStorage.get('classes');
    let total=0;
    for(let cls of classes){
      total += cls.nbr_fille + cls.nbr_garcon;
    }
    this.totalStudents = total;
  }

  async calculateTotalExaminations(){
    const exams = await this.appStorage.get('exams');
    this.totalExaminations = exams.length;
  }

}
