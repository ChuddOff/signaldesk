import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Пароль должен быть больше 8 символов',
  })
  @MaxLength(30, {
    message: 'Пароль должен быть меньше 30 символов',
  })
  password: string;
}
