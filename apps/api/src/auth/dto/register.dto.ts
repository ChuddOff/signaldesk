import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
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
  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'Никнейм должен быть больше 3 символов',
  })
  @MaxLength(30, {
    message: 'Никнейм должен быть меньше 30 символов',
  })
  displayName: string;
}
