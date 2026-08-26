export default function AnelProgresso({
  percentual,
  texto,
}: {
  percentual: number;
  texto: React.ReactNode;
}) {
  const raio = 54;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia * (1 - percentual / 100);

  return (
    <div className="anel-progresso">
      <svg
        className="anel-progresso__svg"
        width="140"
        height="140"
        viewBox="0 0 140 140"
        role="img"
        aria-label={`${percentual}% do ciclo completo`}
      >
        <circle className="anel-progresso__circulo-fundo" cx="70" cy="70" r={raio} />
        <circle
          className="anel-progresso__circulo-valor"
          cx="70"
          cy="70"
          r={raio}
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="66" textAnchor="middle" className="anel-progresso__numero">
          {percentual}%
        </text>
        <text x="70" y="86" textAnchor="middle" className="anel-progresso__legenda">
          DO CICLO
        </text>
      </svg>
      <p className="anel-progresso__texto">{texto}</p>
    </div>
  );
}
