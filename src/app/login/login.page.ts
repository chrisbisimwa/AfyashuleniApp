import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Network, ConnectionStatus } from '@capacitor/network';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';

  networkStatus: ConnectionStatus;

  private apiUrl = 'https://afiashuleni.net/api';
  private readonly STORAGE_KEY = 'authToken';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();


  constructor(private authService: AuthService, private router: Router, private http: HttpClient, private appStorage: Storage) { }

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

    const credentials = { "email": this.email, "password": this.password };

    console.log(JSON.stringify(this.networkStatus));
    if (this.networkStatus.connected) {
      let rs = this.http.post(`${this.apiUrl}/login`, credentials).subscribe((response: any) => {
        if (response.token) {
          this.appStorage.set(this.STORAGE_KEY, response.token).then(async () => {
            const headers = await this.getHeaders();
            this.http.get(`${this.apiUrl}/user`, headers)
              .subscribe((user: any) => {
                this.appStorage.set('user', user);

                //fetch user roles
                this.http.get(`${this.apiUrl}/users/`+user.id+'/roles', headers)
                  .subscribe((roles: any) => {
                    
                    this.appStorage.set('roles', roles.data);
                  }, error => {
                    alert(error.error.message);
                  }
                );
                

                this.router.navigate(['/tabs/home']);
              });


          }

          );
        }

      }, error => {
        alert(error.error.message);
      });
    } else {
      alert('Vous n\'êtes pas connecté à internet');
    }




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
