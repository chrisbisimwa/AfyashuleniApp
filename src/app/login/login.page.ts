import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router:Router) { }

  ngOnInit() {
  }

  login() {
    const credentials = {"email": this.email, "password":this.password};
    this.authService.login(credentials)
      .subscribe(
        () => {
          // Connexion réussie, rediriger vers la page d'accueil
          
          this.router.navigate(['/tabs/home']);
        },
        (error) => {
          // Gérer les erreurs de connexion
          console.error('Erreur de connexion:', error);
          // Afficher un message d'erreur à l'utilisateur
        }
      );
  }

  forgotPassword() {
    this.router.navigate(['password-reset']);
  }

}
