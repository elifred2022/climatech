export type EstadoFecha = {
  estado: string;
  fecha: string;
};

export function localDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function historyOf(value: unknown, estadoActual = ""): EstadoFecha[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as { estado?: unknown; fecha?: unknown };
      const estado = typeof record.estado === "string" ? record.estado.trim() : "";
      const fecha = dateOnly(record.fecha);
      if (!estado || !fecha) return [];
      return [{ estado, fecha }];
    });
  }

  const fecha = dateOnly(value);
  if (!fecha) return [];
  return [{ estado: estadoActual.trim() || "presupuestado", fecha }];
}

export function appendHistory(value: unknown, estado: string, fecha = localDate(), estadoActual = "") {
  return [...historyOf(value, estadoActual), { estado, fecha }];
}

export function formatHistoryDate(fecha: string) {
  const match = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return fecha;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(date);
}

function dateOnly(value: unknown) {
  if (typeof value !== "string") return "";
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}
