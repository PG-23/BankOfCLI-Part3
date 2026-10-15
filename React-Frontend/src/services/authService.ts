import type { ApiError, AuthResponse, LoginRequest, RegisterRequest, User } from '../models';
import { db, delay, type MockUser } from '../mocks/db';
import { isStrongPassword, isValidEmail, isValidName } from '../utils/validation';

const fail = (code: ApiError['code'], message: string, field?: string): never => {
  throw { code, message, field } satisfies ApiError;
};

function generateUsername(firstName: string, lastName: string): string {
  const clean = (s: string) => s.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase();
  const base = (clean(firstName).charAt(0) + clean(lastName)).slice(0, 12);
  let username: string;
  do {
    username = base + Math.floor(1000 + Math.random() * 9000);
  } while (db.users.some(u => u.username === username));
  return username;
}

function generateAccountNumber(): string {
  let num: string;
  do {
    num = String(1_000_000_000 + Math.floor(Math.random() * 9_000_000_000));
  } while (db.accounts.some(a => a.accountNumber === num));
  return num;
}

function toPublicUser(u: MockUser): User {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    username: u.username,
    email: u.email,
  };
}

function toAuthResponse(user: User): AuthResponse {
  const account = db.accounts.find(a => a.userId === user.id);
  if (!account) fail('ACCOUNT_NOT_FOUND', 'No account found for this user.');
  return { user, account: account!, token: `mock-token-${user.id}` };
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  await delay();
  const id = req.identifier.trim().toLowerCase();
  const match = db.users.find(
    u => (u.username === id || u.email.toLowerCase() === id) && u.password === req.password
  );
  if (!match) fail('INVALID_CREDENTIALS', 'Invalid username/email or password.');
  const user = toPublicUser(match!);
  return toAuthResponse(user);
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  await delay();
  if (!isValidName(req.firstName)) fail('VALIDATION_ERROR', 'Enter a valid first name.', 'firstName');
  if (!isValidName(req.lastName)) fail('VALIDATION_ERROR', 'Enter a valid last name.', 'lastName');
  if (!isValidEmail(req.email)) fail('VALIDATION_ERROR', 'Enter a valid email.', 'email');
  if (!isStrongPassword(req.password))
    fail('WEAK_PASSWORD', 'Password must be at least 8 characters and include a number.', 'password');
  if (db.users.some(u => u.email.toLowerCase() === req.email.trim().toLowerCase()))
    fail('EMAIL_TAKEN', 'An account with this email already exists.', 'email');

  const user: User = {
    id: `u_${Date.now()}`,
    firstName: req.firstName.trim(),
    lastName: req.lastName.trim(),
    username: generateUsername(req.firstName, req.lastName),
    email: req.email.trim().toLowerCase(),
  };
  db.users.push({ ...user, password: req.password });
  db.accounts.push({ accountNumber: generateAccountNumber(), balanceCents: 0, userId: user.id });

  return toAuthResponse(user);
}