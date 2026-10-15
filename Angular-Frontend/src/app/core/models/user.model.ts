// CONTRACT LAYER (just a draft to start it)
//must sync it w/API_CONTRACT.md and the mock JSON in mock

//id will stay string since the form inputs in a url value are alr strings
// it avoids conversions/bugs.

export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY';

export interface User {
    id: string;     //this will be auto-gen !!
    firstName: string;
    lastName: string;
    email: string;
    gender?: Gender;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  gender?: Gender;
}

export interface LoginRequest {
    identifier: string;     //this is so either email/userId can login
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}