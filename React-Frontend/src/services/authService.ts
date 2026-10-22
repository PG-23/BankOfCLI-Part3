import type { AuthResponse, LoginRequest, RegisterRequest } from '../models';
import { api } from './apiClient';

export function login(req: LoginRequest): Promise<AuthResponse> {
  // Usernames and stored emails are lowercase, so match the mock's case-insensitive login
  return api.post<AuthResponse>('/auth/login', {
    identifier: req.identifier.trim().toLowerCase(),
    password: req.password,
  });
}

export function register(req: RegisterRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', req);
}