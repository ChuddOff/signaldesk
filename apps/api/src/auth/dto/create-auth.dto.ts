import { IsEmail, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @Min(8, { message: 'Пароль должен быть больше 8 символов' })
  @Max(20, { message: 'Пароль должен быть меньше 20 символов' })
  password: string;
  @IsString()
  @IsNotEmpty()
  @Min(3, { message: 'Никнейм должен быть больше 3 символов' })
  @Max(30, { message: 'Никнейм должен быть меньше 30 символов' })
  displayName: string;
}
