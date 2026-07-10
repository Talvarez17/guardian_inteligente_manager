import { email, minLength, required, schema } from '@angular/forms/signals';

export const emailSchema = schema<string>((field) => {
  required(field, { message: 'El correo electrónico es requerido' });
  email(field, { message: 'El correo electrónico no tiene un formato valido' });
});

export const passwordSchema = schema<string>((field) => {
  required(field, { message: 'La contraseña es requerida' });
});
