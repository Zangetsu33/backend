import { z } from 'zod';

// Definir el esquema de validación
const userSchema = z.object({
  id: z.number().int().positive({ message: 'ID debe ser un entero positivo' }),
  cedula: z.string()
    .regex(/^\d{10}$/, { message: 'Cédula debe tener exactamente 10 dígitos' })
    .nonempty({ message: 'Cédula es requerida' }),
  nombre: z.string()
    .nonempty({ message: 'Nombre es requerido' }),
  apellido: z.string()
    .nonempty({ message: 'Apellido es requerido' }),
  cargo: z.enum(['gerente', 'ejecutivo'], { 
    message: 'Cargo debe ser "gerente" o "ejecutivo"' 
  })
});

// Función para validar usuario completo
function validateUser(input) {
  return userSchema.safeParse(input);
}

// Función para validar usuario parcial (solo algunas propiedades)
function validatePartialUser(input) {
  // Permite que algunas propiedades falten
  const partialSchema = userSchema.partial();
  return partialSchema.safeParse(input);
}

export { validateUser, validatePartialUser };