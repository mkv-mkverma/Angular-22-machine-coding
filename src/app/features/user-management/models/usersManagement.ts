export interface IUsers {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  image:string
}

export interface UsersResponse {
  users: IUsers[];
  total: number;
  skip: number;
  limit: number;
}
