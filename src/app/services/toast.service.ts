import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) {}

  async showError(message: string, duration: number = 3500) {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  }

  async showSuccess(message: string, duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  async showInfo(message: string, duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'primary',
      position: 'bottom',
    });
    await toast.present();
  }
}
