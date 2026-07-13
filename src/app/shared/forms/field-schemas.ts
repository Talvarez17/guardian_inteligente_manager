import { email, min, minLength, pattern, required, schema } from '@angular/forms/signals';

const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
const STREET_NUMBER_PATTERN = /^[a-zA-Z0-9-]+$/;
const PHONE_PATTERN = /^\+?[\d\s-]{10,15}$/;

export const emailSchema = schema<string>((field) => {
  required(field, { message: 'El correo electrónico es requerido' });
  email(field, { message: 'El correo electrónico no tiene un formato valido' });
});

export const passwordSchema = schema<string>((field) => {
  required(field, { message: 'La contraseña es requerida' });
});

export const requiredTextSchema = schema<string>((field) => {
  required(field, { message: 'Este campo es requerido' });
  minLength(field, 2, { message: 'Este campo debe tener al menos 2 caracteres' });
});

export const positiveNumberSchema = schema<number>((field) => {
  required(field, { message: 'Este campo es requerido' });
  min(field, 0, { message: 'El valor no puede ser negativo' });
});

export const rfcSchema = schema<string>((field) => {
  required(field, { message: 'El RFC es requerido' });
  pattern(field, RFC_PATTERN, { message: 'El RFC no tiene un formato válido' });
});

export const exteriorNumberSchema = schema<string>((field) => {
  required(field, { message: 'El número exterior es requerido' });
  pattern(field, STREET_NUMBER_PATTERN, { message: 'Solo se permiten letras, números y guiones' });
});

export const interiorNumberSchema = schema<string>((field) => {
  pattern(field, STREET_NUMBER_PATTERN, { message: 'Solo se permiten letras, números y guiones' });
});

export const phoneSchema = schema<string>((field) => {
  required(field, { message: 'El teléfono es requerido' });
  pattern(field, PHONE_PATTERN, { message: 'El teléfono no tiene un formato válido' });
});
