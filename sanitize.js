export function sanitizeInput(input) {
    const sanitized = input.replace(/[<>]/g, '');
    return sanitized.trim();
  }
  