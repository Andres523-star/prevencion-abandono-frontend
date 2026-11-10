/**
 * Validadores para formularios de estudiantes y autenticacion
 */
export const isValidEmailUCC = (email: string): boolean => {
  const uccRegex = /^[a-zA-Z0-9._%+-]+@(campusucc\.edu\.co|ucc\.edu\.co)$/i;
  return uccRegex.test(email.trim());
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneClean = phone.replace(/[\s-]/g, '');
  return /^3[0-9]{9}$/.test(phoneClean);
};

export const isValidGrade = (grade: number): boolean => {
  return typeof grade === 'number' && !isNaN(grade) && grade >= 0.0 && grade <= 5.0;
};

export const isValidDocumentNumber = (doc: string): boolean => {
  return /^[0-9]{6,12}$/.test(doc.trim());
};
