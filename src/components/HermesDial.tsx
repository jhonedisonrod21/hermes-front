type HermesDialProps = {
  className?: string;
  /** Etiquetas mono alrededor del dial (coordenadas/instrumento). */
  labels?: boolean;
};

const CENTER = 200;
const TICKS = 48; // marcas alrededor del dial; cada 4ª es horaria (12 posiciones)

function polar(angleDeg: number, radius: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(a), y: CENTER + radius * Math.sin(a) };
}

/**
 * Cronógrafo de Hermes: instrumento de latón sobre cielo nocturno. Reloj + la trayectoria
 * del mensajero alado. Es la pieza-firma de la marca; se reutiliza en toda la app.
 */
export function HermesDial({ className = '', labels = true }: HermesDialProps) {
  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const angle = (360 / TICKS) * i;
    const major = i % 4 === 0;
    const outer = 186;
    const inner = major ? 168 : 177;
    const p1 = polar(angle, outer);
    const p2 = polar(angle, inner);
    return { p1, p2, major };
  });

  const hourLabels = labels ? ['XII', 'III', 'VI', 'IX'] : [];

  return (
    <svg
      className={`lp-dial ${className}`.trim()}
      viewBox="0 0 400 400"
      role="img"
      aria-label="Cronógrafo de Hermes"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Anillos */}
      <circle cx={CENTER} cy={CENTER} r="190" className="lp-dial-ring" />
      <circle cx={CENTER} cy={CENTER} r="160" className="lp-dial-ring-thin" />
      <circle cx={CENTER} cy={CENTER} r="118" className="lp-dial-ring-thin" />

      {/* Arco de órbita (la trayectoria del mensajero) */}
      <path d={describeArc(144, -40, 150)} className="lp-dial-orbit" />

      {/* Marcas horarias */}
      <g>
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.p1.x}
            y1={t.p1.y}
            x2={t.p2.x}
            y2={t.p2.y}
            className={t.major ? 'lp-dial-tick-major' : 'lp-dial-tick'}
          />
        ))}
      </g>

      {/* Numerales romanos en los cuadrantes */}
      {hourLabels.map((label, i) => {
        const p = polar(i * 90, 138);
        return (
          <text key={label} x={p.x} y={p.y + 5} className="lp-dial-numeral" textAnchor="middle">
            {label}
          </text>
        );
      })}

      {/* Constelación de puntos (estados de una cita en órbita) */}
      {[-40, 18, 76, 150].map((angle, i) => {
        const p = polar(angle, 144);
        return <circle key={i} cx={p.x} cy={p.y} r={i === 1 ? 5 : 3.5} className="lp-dial-node" />;
      })}

      {/* Aguja que barre (se anima al cargar) */}
      <g className="lp-dial-hand">
        <line x1={CENTER} y1={CENTER} x2={CENTER} y2="44" className="lp-dial-hand-line" />
        <circle cx={CENTER} cy="44" r="5" className="lp-dial-hand-tip" />
      </g>

      {/* Núcleo */}
      <circle cx={CENTER} cy={CENTER} r="9" className="lp-dial-hub" />
      <circle cx={CENTER} cy={CENTER} r="3.5" className="lp-dial-hub-dot" />
    </svg>
  );
}

function describeArc(r: number, startAngle: number, endAngle: number) {
  const start = polar(endAngle, r);
  const end = polar(startAngle, r);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}
