import { email, max, maxLength, min, minLength, pattern, required, schema, validate } from '@angular/forms/signals';

const RFC_PATTERN = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;
const STREET_NUMBER_PATTERN = /^[a-zA-Z0-9-]+$/;
const PHONE_PATTERN = /^\d{10}$/;
const POSTAL_CODE_PATTERN = /^\d{5}$/;

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

export const requiredSelectSchema = schema<string>((field) => {
  required(field, { message: 'Debes seleccionar una opción' });
});

export const positiveNumberSchema = schema<number>((field) => {
  required(field, { message: 'Este campo es requerido' });
  min(field, 0, { message: 'El valor no puede ser negativo' });
});

export const rfcSchema = schema<string>((field) => {
  required(field, { message: 'El RFC es requerido' });
  maxLength(field, 12, { message: 'El RFC debe tener 12 caracteres' });
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
  maxLength(field, 10, { message: 'El teléfono debe tener 10 dígitos' });
  pattern(field, PHONE_PATTERN, { message: 'El teléfono no tiene un formato válido' });
});

export const postalCodeSchema = schema<string>((field) => {
  required(field, { message: 'El código postal es requerido' });
  maxLength(field, 5, { message: 'El código postal debe tener 5 dígitos' });
  pattern(field, POSTAL_CODE_PATTERN, { message: 'El código postal debe tener 5 dígitos' });
});

export const strictlyPositiveNumberSchema = schema<number>((field) => {
  required(field, { message: 'Este campo es requerido' });
  min(field, 0.01, { message: 'El valor debe ser mayor a 0' });
});

export const positiveIntegerSchema = schema<number>((field) => {
  required(field, { message: 'Este campo es requerido' });
  min(field, 1, { message: 'El valor debe ser mayor a 0' });
  validate(field, ({ value }) =>
    Number.isInteger(value()) ? undefined : { kind: 'integer', message: 'El valor debe ser un número entero, sin decimales' },
  );
});

export const monthSchema = schema<number>((field) => {
  required(field, { message: 'El mes es requerido' });
  min(field, 1, { message: 'El mes debe estar entre 1 y 12' });
  max(field, 12, { message: 'El mes debe estar entre 1 y 12' });
});

export const yearSchema = schema<number>((field) => {
  required(field, { message: 'El año es requerido' });
  min(field, 2000, { message: 'Año no válido' });
});
