import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const inserted = await fetch(`${url}/rest/v1/presupuestos`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    email: "presupuesto.prueba.20261002@gmail.com",
    nombre: "Prueba",
    apellido: "Presupuesto",
    telefono: 1127003907,
    direccion_instalacion: "Av. Corrientes 1234",
    tipo_servicio: "Diagnóstico",
    capacidad_equipo: 3000,
    ubicacion_fisica: "dormitorio",
    facil_acceso: "si",
    tiene_electrcidad: "si",
    nuevo: "si",
    usado_desinstalamos: "no",
  }),
});
const created = await inserted.json();
console.log("insert", inserted.status, Array.isArray(created) ? created[0]?.id : "error");
