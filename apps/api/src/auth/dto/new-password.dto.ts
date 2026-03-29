import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;
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
