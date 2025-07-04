import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Network, ConnectionStatus } from '@capacitor/network';
import { environment } from '../../environments/environment';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  loginInProgress = false;

  networkStatus: ConnectionStatus;

  private apiUrl = environment.apiUrl;
  private readonly STORAGE_KEY = 'authToken';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private appStorage: Storage,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (Network) {
      Network.getStatus().then(status => {
        this.networkStatus = status;
      });
      Network.addListener('networkStatusChange', (status) => {
        this.networkStatus = status;
      });
    }
  }

  async login() {
    const credentials = { email: this.email, password: this.password };

    if (!this.networkStatus?.connected) {
      this.toastService.showError("Vous n'êtes pas connecté à internet");
      return;
    }

    this.http.post(`${this.apiUrl}/login`, credentials).subscribe({
      next: async (response: any) => {
        this.loginInProgress = true;
        if (response.token) {
          await this.appStorage.set(this.STORAGE_KEY, response.token);
          const headers = await this.getHeaders();
          this.http.get(`${this.apiUrl}/user`, headers).subscribe({
            next: async (user: any) => {
              await this.appStorage.set('user', user);

              this.http.get(`${this.apiUrl}/users/${user.id}/roles`, headers).subscribe({
                next: async (roles: any) => {
                  await this.appStorage.set('roles', roles.data);
                  
                  this.toastService.showSuccess('Connexion réussie !');
                },
                error: async (error) => {
                  this.toastService.showError(error.error?.message || "Erreur lors du chargement des rôles");
                }
              });

              this.loginInProgress = false;

              this.router.navigate(['/tabs/home']);
            },
            error: async (error) => {
              this.toastService.showError(error.error?.message || "Erreur lors de la récupération de l'utilisateur");
            }
          });
        } else {
          this.toastService.showError("La réponse du serveur ne contient pas de token.");
        }
      },
      error: async (error) => {
        this.toastService.showError(error.error?.message || "Identifiants incorrects");
      }
    });
  }

  private async getHeaders() {
    const token = await this.appStorage.get('authToken');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  forgotPassword() {
    this.router.navigate(['password-reset']);
  }
}