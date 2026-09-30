import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

export const API_BASE_URL = 'http://localhost:3000/api';

export interface IEmployee {
  id: number;
  name: string;
  email: string;
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
}

@Service()
export class EmployeeService {
  private readonly http = inject(HttpClient);

  getEmployees(): Observable<APIResponse<IEmployee[]>> {
    return this.http.get<APIResponse<IEmployee[]>>(`${API_BASE_URL}/employees`);
  }

  addEmployee(name: string, email: string): Observable<APIResponse<IEmployee>> {
    return this.http.post<APIResponse<IEmployee>>(`${API_BASE_URL}/employee/`, { name, email });
  }

  updateEmployee(emp: IEmployee): Observable<APIResponse<IEmployee[]>> {
    return this.http.put<APIResponse<IEmployee[]>>(`${API_BASE_URL}/employee/${emp.id}`, {
      name: emp.name,
      email: emp.email,
    });
  }

  deleteEmployee(id: number): Observable<APIResponse<IEmployee[]>> {
    return this.http.delete<APIResponse<IEmployee[]>>(`${API_BASE_URL}/employee/${id}`);
  }
}
