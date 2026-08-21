import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { IUsers, UsersResponse } from '../models/usersManagement';

@Service()
export class UserManagementService {
  private http = inject(HttpClient);

  getUsers() {
    return this.http.get<UsersResponse>(`https://dummyjson.com/users`);
  }

  getUser(id: number) {
    return this.http.get<IUsers>(`https://dummyjson.com/users/${id}`);
  }

  createUser({ firstName, lastName, age }: { firstName: string; lastName: string; age: number }) {
    return this.http.post(`https://dummyjson.com/users/add`, {
      firstName,
      lastName,
      age,
    });
  }

  updateUser(id: number) {
    this.http.put(`https://dummyjson.com/users/${id}`, {});
  }

  deleteUser(id: number) {
    return this.http.delete(`https://dummyjson.com/users/${id}`);
  }
}
