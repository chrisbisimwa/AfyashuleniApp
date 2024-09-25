import { Component, ViewChild } from '@angular/core';

import { ChartConfiguration, ChartOptions } from 'chart.js';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardPage {
  @ViewChild('lineCanvas') lineCanvas: any;
  lineChart: any;
  
  constructor() {}

  ionViewDidEnter() {
    this.createLineChart();
  }

  new(){
    console.log('new');
  }

  createLineChart() {
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line', // Type du graphique
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Examinations',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      },
    });
  }


  loadChartData(){
    
  }

}
