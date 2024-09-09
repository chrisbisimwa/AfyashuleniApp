import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from './data.service';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://afiashuleni.kivutech.net/api';

  constructor(private http: HttpClient, private appStorage: Storage) {}

  private async getHeaders() {
    const token = await this.appStorage.get('authToken');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  async getSchoolYears() {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/school-years`, headers);
  }

  async getSchools() {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/schools`, headers);
  }

  async postSchool(data: any) {
    const headers = await this.getHeaders();
    return this.http.post(`${this.apiUrl}/schools`, data, headers);
  }

  async postClass(schoolId:any, data: any) {
    const headers = await this.getHeaders();
    return this.http.post(`${this.apiUrl+'/schools/'+schoolId+'/classes'}`, data, headers);
  }

  async postStudent(data: any) {
    const headers = await this.getHeaders();
    return this.http.post(`${this.apiUrl}/students`, data, headers);
  }

  async postStudentHistory(data: any) {
    const headers = await this.getHeaders();
    return this.http.post(`${this.apiUrl}/student-histories`, data, headers);
  }

  async getProblems() {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/problems`, headers);
  }

  async getClasses(schoolId: number) {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl+'/schools/'+schoolId+'/classes'}`, headers);
  }

  async getStudentHistory(schoolYearId: number) {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl+'/school-years/'+schoolYearId}/student-histories`, headers);
  }

  async getStudents(){
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/students`, headers);
  }

  async getExaminations(studentId: number) {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/students/${studentId}/examinations`, headers);
  }

  async getUserRoles(userId: number) {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/users/${userId}/roles`, headers);
  }

  async deleteSchool(schoolId:number){
    const headers = await this.getHeaders();
    return this.http.delete(`${this.apiUrl}/schools/${schoolId}`, headers);
  }

  

  // Méthodes similaires pour les autres ressources...

  async submitExamination(studentId: number, data: any) {
    const headers = await this.getHeaders();
    return this.http.post(
      `${this.apiUrl}/students/${studentId}/examinations`,
      data,
      headers
    );
  }
}
