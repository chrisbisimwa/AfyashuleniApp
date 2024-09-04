import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataService } from './data.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://afiashuleni.kivutech.net/api';
  private readonly STORAGE_KEY = 'authToken'; // Key for storing the token
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();


  constructor(private http: HttpClient, private dataService: DataService) { }

  login(credentials: { email: string; password: string }) {
    console.log(credentials);
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        console.log('Réponse de connexion:', response.token);
        this.dataService.set(this.STORAGE_KEY, response.token);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  private async getHeaders() {
    const token = await this.dataService.get('authToken');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  logout() {
    this.dataService.remove(this.STORAGE_KEY);
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn() {
    const token:any = this.dataService.get(this.STORAGE_KEY);
    if(token.__zone_symbol__value.length > 0){
      return true;
    }else{
      return false;
    }
  }


  async getToken(): Promise<string | null> {
    return await this.dataService.get(this.STORAGE_KEY);
  }

  async checkTokenValidity(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
      return false;
    }

    const response: any = await this.http.get(`${this.apiUrl}/user`, { headers: { Authorization: `Bearer ${token}` } }).toPromise();
    if (response && response.status === 200) {
      return true;
    }else{
      return false;
    }
  }

  async getUser() {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/user`, headers);
  }

  



  /* async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getUser();
    // Check user object for permissions (replace with actual logic)
    return user?.permissions?.includes(permission);
  } */
}
