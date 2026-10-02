export function isAdmin(rol: string) {
  const value = rol.trim().toLowerCase();
  return value === "administrador" || value === "admin";
}
