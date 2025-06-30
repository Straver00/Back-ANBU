export class CreateUserDto {
  full_name: string;
  alias: string;
  email: string;
  password: string;
  role_id: string;
  active: boolean;
}
