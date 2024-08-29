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
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        console.log('Réponse de connexion:', response.token);
        this.dataService.set(this.STORAGE_KEY, response.token);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  logout() {
    this.dataService.remove(this.STORAGE_KEY);
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn() {
    const token = this.dataService.get(this.STORAGE_KEY);
    return !!token; // Simple check for token presence (converts to boolean)
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
    const token = await this.getToken();
    if (!token) {
      return null;  // Handle case where token is not available
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(`${this.apiUrl}/user`, { headers });
  }

  /* async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getUser();
    // Check user object for permissions (replace with actual logic)
    return user?.permissions?.includes(permission);
  } */
}
