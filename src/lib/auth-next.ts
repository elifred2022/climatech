const allowed = new Set(["/presupuesto", "/presupuestos", "/usuarios", "/tablas-tecnicas"]);

export function safeNext(value: string | string[] | undefined) {
  const path = Array.isArray(value) ? value[0] : value;
  return path && allowed.has(path) ? path : "/";
}
