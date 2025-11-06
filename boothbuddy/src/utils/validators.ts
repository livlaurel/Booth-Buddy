// Check individual password requirements
export function getPasswordChecklist(password: string) {
  return {
    length: password.length >= 8 && password.length <= 64,
    number: /[0-9]/.test(password),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

// Validate overall password 
export function isPasswordValid(password: string): boolean {
  const checklist = getPasswordChecklist(password);
  return (
    checklist.length &&
    checklist.number &&
    checklist.uppercase &&
    checklist.lowercase &&
    checklist.special
  );
}