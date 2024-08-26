export class RegisterDto {
  username: string;
  password: string;
  role: 'user' | 'admin' | 'writer' | 'manager' | 'client';
}
