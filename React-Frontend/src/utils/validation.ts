export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isStrongPassword = (password: string) =>
  password.length >= 8 && /\d/.test(password); // agree on rules as a team

export const isValidName = (name: string) => /[a-zA-Z]/.test(name);

export const isValidAccountNumber = (value:string) =>
  /^\d{10}$/.test(value.replace(/\s/g, ''));

export const isValidReference = (value: string) =>{
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 140;
};