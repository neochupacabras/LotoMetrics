import Link from "next/link";
import { notFound } from "next/navigation";
import Dezenas from "@/components/Dezenas";
import { getConcursosPaginado, getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { formatarData, formatarMoeda, isCodigoLoteriaValido } from "@/lib/format";

const POR_PAGINA = 20;

export default async function ResultadosPage({
  params,
  searchParams,
}: {
  params: Promise<{ loteria: string }>;
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  const { pagina: paginaParam } = await searchParams;

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    notFound();
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    notFound();
  }

  const pagina = Math.max(1, Number(paginaParam) || 1);

  const [ultimo, { concursos, total }] = await Promise.all([
    getUltimoConcurso(loteria.id),
    getConcursosPaginado(loteria.id, pagina, POR_PAGINA),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="container secao">
      <p className="eyebrow">Edição mais recente</p>

      {ultimo ? (
        <>
          <h1 className="titulo-edicao">Concurso {ultimo.numero}</h1>
          <p className="subtitulo-edicao">
            Sorteado em {formatarData(ultimo.dataSorteio)}
            {ultimo.localSorteio ? ` · ${ultimo.localSorteio}` : ""}
            {ultimo.municipioUfSorteio ? ` · ${ultimo.municipioUfSorteio}` : ""}
          </p>

          <Dezenas dezenas={ultimo.dezenas} />

          <dl className="ficha">
            <div>
              <dt>Resultado</dt>
              <dd>
                {ultimo.acumulado ? (
                  <span className="badge badge--acumulou">Acumulou</span>
                ) : (
                  <span className="badge badge--teve-ganhador">Teve ganhador</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Próximo concurso</dt>
              <dd>{formatarData(ultimo.dataProximoConcurso)}</dd>
            </div>
            <div>
              <dt>Estimativa do próximo prêmio</dt>
              <dd>{formatarMoeda(ultimo.valorEstimadoProximo)}</dd>
            </div>
          </dl>

          {ultimo.premiacoes.length > 0 && (
            <table className="tabela-premiacao">
              <caption>Premiação por faixa de acerto</caption>
              <thead>
                <tr>
                  <th>Faixa</th>
                  <th>Ganhadores</th>
                  <th className="valor">Prêmio</th>
                </tr>
              </thead>
              <tbody>
                {ultimo.premiacoes.map((p) => (
                  <tr key={p.faixa}>
                    <td>{p.descricaoFaixa ?? `Faixa ${p.faixa}`}</td>
                    <td>{p.qtdGanhadores}</td>
                    <td className="valor">{formatarMoeda(p.valorPremio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <Link href={`/${codigoLoteria}/resultados/${ultimo.numero}`}>
            Ver detalhes do concurso {ultimo.numero} →
          </Link>
        </>
      ) : (
        <p>Nenhum concurso encontrado ainda. Rode o importador para popular o banco.</p>
      )}

      <div className="aviso-legal">
        <strong>Lembrete:</strong> os resultados acima são oficiais e públicos.
        Estatísticas e tendências históricas não alteram a probabilidade de um
        sorteio futuro — cada concurso é um evento independente.
      </div>

      <p className="eyebrow" style={{ marginTop: "44px" }}>
        Histórico de concursos
      </p>

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

      <div className="paginacao">
        {pagina > 1 ? (
          <Link href={`/${codigoLoteria}/resultados?pagina=${pagina - 1}`}>← Mais recentes</Link>
        ) : (
          <span className="desabilitado">← Mais recentes</span>
        )}
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        {pagina < totalPaginas ? (
          <Link href={`/${codigoLoteria}/resultados?pagina=${pagina + 1}`}>Mais antigos →</Link>
        ) : (
          <span className="desabilitado">Mais antigos →</span>
        )}
      </div>
    </div>
  );
}
