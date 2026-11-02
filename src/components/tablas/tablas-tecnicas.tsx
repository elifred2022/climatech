const refrigerantes = [
  {
    tipo: "R-22",
    succion: "60 – 70 PSI",
    descarga: "210 – 250 PSI",
    evaporacion: "–2°C a +5°C",
    aceite: "Mineral / AB",
  },
  {
    tipo: "R-410A",
    succion: "115 – 130 PSI",
    descarga: "350 – 410 PSI",
    evaporacion: "–2°C a +5°C",
    aceite: "Sintético (POE)",
  },
  {
    tipo: "R-32",
    succion: "115 – 130 PSI",
    descarga: "340 – 400 PSI",
    evaporacion: "–2°C a +5°C",
    aceite: "Sintético (POE)",
  },
];

const capacidades = [
  {
    frigorias: "2,250 fg",
    btu: "~9,000 BTU",
    equipos: [
      { refrigerante: "R-22", carga: "650g – 800g", succion: "60 – 65 PSI" },
      { refrigerante: "R-410A", carga: "550g – 700g", succion: "115 – 120 PSI" },
      { refrigerante: "R-32", carga: "400g – 500g", succion: "115 – 120 PSI" },
    ],
  },
  {
    frigorias: "3,000 fg",
    btu: "~12,000 BTU",
    equipos: [
      { refrigerante: "R-22", carga: "850g – 1,050g", succion: "62 – 68 PSI" },
      { refrigerante: "R-410A", carga: "750g – 950g", succion: "120 PSI" },
      { refrigerante: "R-32", carga: "550g – 680g", succion: "120 PSI" },
    ],
  },
  {
    frigorias: "4,500 fg",
    btu: "~18,000 BTU",
    equipos: [
      { refrigerante: "R-22", carga: "1,200g – 1,500g", succion: "65 – 70 PSI" },
      { refrigerante: "R-410A", carga: "1,100g – 1,350g", succion: "120 – 125 PSI" },
      { refrigerante: "R-32", carga: "800g – 980g", succion: "120 – 125 PSI" },
    ],
  },
  {
    frigorias: "6,000 fg",
    btu: "~24,000 BTU",
    equipos: [
      { refrigerante: "R-22", carga: "1,600g – 2,000g", succion: "68 – 72 PSI" },
      { refrigerante: "R-410A", carga: "1,450g – 1,800g", succion: "125 – 130 PSI" },
      { refrigerante: "R-32", carga: "1,050g – 1,350g", succion: "125 – 130 PSI" },
    ],
  },
];

const canos = [
  {
    capacidad: "2,250 fg (~9,000 BTU)",
    liquido: '1/4"',
    gas: '3/8"',
    tuercas: '2 tuercas de 1/4" + 2 tuercas de 3/8"',
  },
  {
    capacidad: "3,000 fg (~12,000 BTU)",
    liquido: '1/4"',
    gas: '1/2" (o 3/8" en algunos R-410A)',
    tuercas: '2 tuercas de 1/4" + 2 tuercas de 1/2"',
  },
  {
    capacidad: "4,500 fg (~18,000 BTU)",
    liquido: '1/4"',
    gas: '1/2" (o 5/8" según fabricante)',
    tuercas: '2 tuercas de 1/4" + 2 tuercas de 1/2" (o 5/8")',
  },
  {
    capacidad: "6,000 fg (~24,000 BTU)",
    liquido: '3/8" (o 1/4")',
    gas: '5/8"',
    tuercas: '2 tuercas de 3/8" + 2 tuercas de 5/8"',
  },
  {
    capacidad: "9,000 fg / Piso Techo",
    liquido: '3/8"',
    gas: '3/4"',
    tuercas: '2 tuercas de 3/8" + 2 tuercas de 3/4"',
  },
];

export function TablasTecnicas() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold tracking-tight">Parámetros generales por tipo de refrigerante (modo frío)</h2>
        <ul className="flex flex-col gap-3 lg:hidden">
          {refrigerantes.map((item) => (
            <li key={item.tipo} className="rounded-2xl border border-[#d3e7f3] bg-white p-3">
              <p className="text-sm font-semibold">{item.tipo}</p>
              <dl className="mt-3 grid grid-cols-[9.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                <Dato label="Presión de succión (baja)" value={item.succion} />
                <Dato label="Presión de descarga (alta)" value={item.descarga} />
                <Dato label="Temp. de evaporación" value={item.evaporacion} />
                <Dato label="Tipo de aceite" value={item.aceite} />
              </dl>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d3e7f3] text-xs text-navy/50">
                <th className={head}>Refrigerante</th>
                <th className={head}>Presión de succión (baja)</th>
                <th className={head}>Presión de descarga (alta)</th>
                <th className={head}>Temp. de evaporación</th>
                <th className={head}>Tipo de aceite</th>
              </tr>
            </thead>
            <tbody>
              {refrigerantes.map((item) => (
                <tr key={item.tipo} className="border-b border-[#e7f3fa]">
                  <td className={`${cell} font-semibold`}>{item.tipo}</td>
                  <td className={cell}>{item.succion}</td>
                  <td className={cell}>{item.descarga}</td>
                  <td className={cell}>{item.evaporacion}</td>
                  <td className={cell}>{item.aceite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold tracking-tight">
          Capacidad del split vs. carga estimada de fábrica y presión de succión
        </h2>
        <ul className="flex flex-col gap-3 lg:hidden">
          {capacidades.map((grupo) => (
            <li key={grupo.btu} className="rounded-2xl border border-[#d3e7f3] bg-white p-3">
              <p className="text-sm font-semibold">
                {grupo.frigorias} · {grupo.btu}
              </p>
              <ul className="mt-3 flex flex-col gap-3">
                {grupo.equipos.map((equipo) => (
                  <li key={equipo.refrigerante} className="border-t border-[#e7f3fa] pt-3">
                    <p className="text-sm font-semibold">{equipo.refrigerante}</p>
                    <dl className="mt-2 grid grid-cols-[9.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                      <Dato label="Carga de fábrica" value={equipo.carga} />
                      <Dato label="Presión de succión" value={equipo.succion} />
                    </dl>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d3e7f3] text-xs text-navy/50">
                <th className={head}>Capacidad (frigorías)</th>
                <th className={head}>Capacidad (BTU)</th>
                <th className={head}>Refrigerante</th>
                <th className={head}>Carga estimada de fábrica</th>
                <th className={head}>Presión de succión (operativa)</th>
              </tr>
            </thead>
            <tbody>
              {capacidades.map((grupo) =>
                grupo.equipos.map((equipo, index) => (
                  <tr
                    key={`${grupo.btu}-${equipo.refrigerante}`}
                    className={index === grupo.equipos.length - 1 ? "border-b border-[#d3e7f3]" : "border-b border-[#e7f3fa]"}
                  >
                    {index === 0 ? (
                      <>
                        <td className={`${cell} align-middle font-semibold`} rowSpan={grupo.equipos.length}>
                          {grupo.frigorias}
                        </td>
                        <td className={`${cell} align-middle font-semibold`} rowSpan={grupo.equipos.length}>
                          {grupo.btu}
                        </td>
                      </>
                    ) : null}
                    <td className={cell}>{equipo.refrigerante}</td>
                    <td className={cell}>{equipo.carga}</td>
                    <td className={cell}>{equipo.succion}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold tracking-tight">
          Combinación de caños y tuercas según la capacidad del split
        </h2>
        <ul className="flex flex-col gap-3 lg:hidden">
          {canos.map((item) => (
            <li key={item.capacidad} className="rounded-2xl border border-[#d3e7f3] bg-white p-3">
              <p className="text-sm font-semibold">{item.capacidad}</p>
              <dl className="mt-3 grid grid-cols-[9.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                <Dato label="Línea de líquido (fina)" value={item.liquido} />
                <Dato label="Línea de gas (gruesa)" value={item.gas} />
                <Dato label="Tuercas por instalación" value={item.tuercas} />
              </dl>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d3e7f3] text-xs text-navy/50">
                <th className={head}>Capacidad del split</th>
                <th className={head}>Línea de líquido (fina)</th>
                <th className={head}>Línea de gas (gruesa)</th>
                <th className={head}>Tuercas necesarias por instalación</th>
              </tr>
            </thead>
            <tbody>
              {canos.map((item) => (
                <tr key={item.capacidad} className="border-b border-[#e7f3fa]">
                  <td className={`${cell} font-semibold`}>{item.capacidad}</td>
                  <td className={cell}>{item.liquido}</td>
                  <td className={cell}>{item.gas}</td>
                  <td className={cell}>{item.tuercas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const head = "px-2 py-2 text-left font-semibold";
const cell = "px-2 py-2";

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-navy/50">{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
