export function getDateNow() {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? new Date(2025, 3, 14, 8, 0, 0) : new Date();
}
