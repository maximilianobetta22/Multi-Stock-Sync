export const validateEmail = (_: any, value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || emailRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Ingrese un correo electrónico válido');
  };
  
  export const validatePhone = (_: any, value: string) => {
    const phoneRegex = /^\+?\d{8,15}$/;
    if (!value || phoneRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Ingrese un teléfono válido');
  };
  
  export const validateDni = (_: any, value: string) => {
    // Validación básica para DNI/RUT (puedes ajustar según país)
    const dniRegex = /^[0-9]{7,9}-?[0-9kK]?$/;
    if (!value || dniRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Ingrese un DNI/RUT válido');
  };
  
  export const validateTaxId = (_: any, value: string) => {
    // Validación básica para RUT/RUC empresarial
    const taxIdRegex = /^[0-9]{8,10}-?[0-9kK]?$/;
    if (!value || taxIdRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Ingrese un RUT/RUC válido');
  };