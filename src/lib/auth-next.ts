const allowed = new Set(["/presupuesto", "/presupuestos", "/usuarios"]);

export function safeNext(value: string | string[] | undefined) {
  const path = Array.isArray(value) ? value[0] : value;
  return path && allowed.has(path) ? path : "/";
}
