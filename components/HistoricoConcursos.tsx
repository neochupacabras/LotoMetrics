import Link from "next/link";
import Dezenas from "@/components/Dezenas";
import Anuncio from "@/components/Anuncio";
import { formatarData } from "@/lib/format";
import type { ConcursoResumo } from "@/lib/types";

export const CONCURSOS_POR_PAGINA = 20;

// Página 1 do histórico é o próprio hub (/resultados); as demais ficam em
// /resultados/pagina/N, rota estática que pode sair do cache (ISR). O
// antigo ?pagina=N redireciona para cá (next.config.ts).
export function urlPaginaResultados(codigoLoteria: string, pagina: number): string {
  return pagina <= 1
    ? `/${codigoLoteria}/resultados`
    : `/${codigoLoteria}/resultados/pagina/${pagina}`;
}

export function totalPaginasResultados(totalConcursos: number): number {
  return Math.max(1, Math.ceil(totalConcursos / CONCURSOS_POR_PAGINA));
}

// Lista de concursos + paginação, usada no hub e nas páginas do histórico.
export default function HistoricoConcursos({
  codigoLoteria,
  concursos,
  pagina,
  totalPaginas,
}: {
  codigoLoteria: string;
  concursos: ConcursoResumo[];
  pagina: number;
  totalPaginas: number;
}) {
  return (
    <>
      <div className="ledger">
        {concursos.map((c) => (
          <Link
            key={c.numero}
            href={`/${codigoLoteria}/resultados/${c.numero}`}
            className="ledger__linha"
          >
            <span className="ledger__numero">#{c.numero}</span>
            <span className="ledger__data">{formatarData(c.dataSorteio)}</span>
            <Dezenas dezenas={c.dezenas} tamanho="pequena" wrapperClassName="ledger__dezenas" />
            <span className="ledger__status">
              {c.acumulado ? (
                <span className="badge badge--acumulou">Acumulou</span>
              ) : (
                <span className="badge badge--teve-ganhador">Ganhador</span>
              )}
            </span>
          </Link>
        ))}
      </div>

      <Anuncio slot="8557071463" className="anuncio-entre-secoes" />

      <div className="paginacao">
        {pagina > 1 ? (
          <Link href={urlPaginaResultados(codigoLoteria, pagina - 1)}>← Mais recentes</Link>
        ) : (
          <span className="desabilitado">← Mais recentes</span>
        )}
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        {pagina < totalPaginas ? (
          <Link href={urlPaginaResultados(codigoLoteria, pagina + 1)}>Mais antigos →</Link>
        ) : (
          <span className="desabilitado">Mais antigos →</span>
        )}
      </div>
    </>
  );
}
