import type { ProjecaoAcumulo } from "@/lib/probabilidades";
import Link from "next/link";

interface Props {
  projecao: ProjecaoAcumulo;
  nomeLoteria: string;
  numeroConcurso: number;
  dataProximo: string | null;
  acumulado: boolean;
}

function formatarReais(v: number): string {
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(2).replace(".", ",")} bi`;
  if (v >= 1_000_000)     return `R$ ${(v / 1_000_000).toFixed(1).replace(".", ",")} milhões`;
  if (v >= 1_000)         return `R$ ${(v / 1_000).toFixed(0)} mil`;
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function formatarPct(p: number): string {
  if (p >= 0.01)  return `${(p * 100).toFixed(1)}%`;
  if (p >= 0.001) return `${(p * 100).toFixed(2)}%`;
  return `< 0,1%`;
}

function formatarData(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

function BarraProb({ prob, label, cor }: { prob: number; label: string; cor: string }) {
  const pct = Math.min(prob * 100, 100);
  // Escala logarítmica para visualização — prob muito baixas ficariam invisíveis
  const largura = Math.max(pct > 0 ? 2 + Math.log10(pct + 0.01) * 25 : 0, 0);

  return (
    <div className="projecao-barra-linha">
      <span className="projecao-barra-label">{label}</span>
      <div className="projecao-barra-track">
        <div
          className="projecao-barra-fill"
          style={{ width: `${Math.min(largura, 100)}%`, background: cor }}
        />
      </div>
      <span className="projecao-barra-pct" style={{ color: cor }}>
        {formatarPct(prob)}
      </span>
    </div>
  );
}

export default function ProjecaoAcumuloCard({
  projecao,
  nomeLoteria,
  numeroConcurso,
  dataProximo,
  acumulado,
}: Props) {
  const temAcumulo = projecao.concursosAcumulados > 0 || acumulado;
  const altaChance  = projecao.probAoMenosUmGanhador > 0.5;
  const mediaChance = projecao.probAoMenosUmGanhador > 0.2;

  const corDestaque = altaChance ? "#166534" : mediaChance ? "#92400e" : "#1e4b3c";

  return (
    <div className={`projecao-card ${temAcumulo ? "projecao-card--acumulado" : ""}`}>

      {/* Cabeçalho */}
      <div className="projecao-card__header">
        <div>
          <p className="projecao-card__eyebrow">
            Próximo concurso — {nomeLoteria} {numeroConcurso}
          </p>
          {dataProximo && (
            <p className="projecao-card__data">{formatarData(dataProximo)}</p>
          )}
        </div>
        {temAcumulo && (
          <div className="projecao-card__badge-acumulo">
            {projecao.concursosAcumulados > 0
              ? `${projecao.concursosAcumulados} concurso${projecao.concursosAcumulados > 1 ? "s" : ""} acumulado${projecao.concursosAcumulados > 1 ? "s" : ""}`
              : "Acumulado"}
          </div>
        )}
      </div>

      {/* Prêmio estimado */}
      <div className="projecao-card__premio">
        <div className="projecao-card__premio-valor" style={{ color: corDestaque }}>
          {formatarReais(projecao.premioEstimado)}
        </div>
        <div className="projecao-card__premio-label">
          estimado para o prêmio principal
          {projecao.premioMinimo > 0 && projecao.premioMinimo !== projecao.premioEstimado && (
            <span className="projecao-card__minimo">
              {" "}(mínimo garantido: {formatarReais(projecao.premioMinimo)})
            </span>
          )}
        </div>
      </div>

      {/* Probabilidade de haver ganhador */}
      <div className="projecao-card__secao">
        <p className="projecao-card__secao-titulo">
          Chance de haver ganhador no próximo concurso
        </p>
        <p className="projecao-card__tickets-nota">
          Baseado em ~{(projecao.ticketsEstimados / 1_000_000).toFixed(1)} milhões de apostas estimadas
        </p>

        <div className="projecao-barras">
          <BarraProb
            prob={projecao.probGanhadorSeVenderMenos}
            label="Se vender 50% menos"
            cor="#8c8874"
          />
          <BarraProb
            prob={projecao.probAoMenosUmGanhador}
            label="Estimativa atual"
            cor={corDestaque}
          />
          <BarraProb
            prob={projecao.probGanhadorSeVenderMais}
            label="Se vender 50% mais"
            cor="#1e4b3c"
          />
        </div>
      </div>

      {/* Chance de um ticket individual */}
      <div className="projecao-card__secao projecao-card__secao--menor">
        <p className="projecao-card__secao-titulo">Chance de um único bilhete ganhar</p>
        <p className="projecao-card__um-ticket">
          1 em {Math.round(1 / projecao.probGanhadorUmTicket).toLocaleString("pt-BR")}
        </p>
        <p className="projecao-card__um-ticket-nota">
          Essa probabilidade é fixa — não muda com o tamanho do prêmio acumulado,
          nem com quantos sorteios ficaram sem ganhador.
        </p>
      </div>

      {/* Nota explicativa */}
      <p className="projecao-card__nota">
        A estimativa de apostas leva em conta o crescimento de interesse durante acúmulos.
        Os valores do prêmio são informados pela Caixa no resultado do último concurso e
        podem variar. {" "}
        <Link href="/dicas/retorno-ao-apostador" className="projecao-card__link">
          Entenda o retorno ao apostador →
        </Link>
      </p>
    </div>
  );
}
