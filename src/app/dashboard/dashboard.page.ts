import { Component } from '@angular/core';

import { ChartConfiguration, ChartOptions } from 'chart.js';
import { IonItemSliding, NavController, Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardPage {

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        data: [12, 19, 3, 5, 2, 3],
        label: 'Reported',
        fill: true,
        tension: 1,
        borderColor: 'black',
        backgroundColor: '#EE5A55',
      },
      {
        data: [18, 19, 3, 10, 2, 60],
        label: 'Resolved',
        fill: true,
        tension: 1,
        borderColor: 'black',
        backgroundColor: '#0073e5',
      },
    ],
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
  };
  public lineChartLegend = true;
  constructor() {}

  new(){
    console.log('new');
  }

}
