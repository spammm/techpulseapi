export class UpdateUserDto {
  username?: string;
  password?: string;
  role?: 'admin' | 'writer' | 'manager' | 'client' | 'user';
  avatar?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  publicAlias?: string;
  note?: string;
  about?: string;
  contacts?: { name: string; value: string }[];
}
