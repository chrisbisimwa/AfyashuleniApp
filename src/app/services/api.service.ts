import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://afiashuleni.kivutech.net/api';

  constructor(private http: HttpClient, private dataService: DataService) {}

  private async getHeaders() {
    const token = await this.dataService.get('authToken');
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

  async postClass(data: any) {
    const headers = await this.getHeaders();
    return this.http.post(`${this.apiUrl}/classes`, data, headers);
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
    return this.http.get(`${this.apiUrl+'/schools/'+schoolId}/classes`, headers);
  }

  async getStudentHistory(schoolYearId: number) {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl+'/school-years/'+schoolYearId}/student-histories`, headers);
  }

  async getStudents(){
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/students`, headers);
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
