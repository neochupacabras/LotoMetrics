import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import TelemetriaBeacon from "@/components/TelemetriaBeacon";
import HistoricoConcursos, {
  CONCURSOS_POR_PAGINA,
  totalPaginasResultados,
  urlPaginaResultados,
} from "@/components/HistoricoConcursos";
import { getConcursosPaginado, getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";

// Páginas 2+ do histórico de resultados. Eram /resultados?pagina=N, que
// obrigava o hub inteiro a renderizar a cada visita; o redirect 308 do
// formato antigo está em next.config.ts. A pasta estática "pagina" tem
// precedência sobre o segmento [numero] vizinho.
export const revalidate = 3600;

// Necessário para o ISR num segmento dinâmico aninhado (ver o comentário
// em resultados/[numero]/page.tsx): vazio de propósito, cada página é
// gerada e cacheada no primeiro acesso.
export async function generateStaticParams() {
  return [];
}

// Só inteiros sem zero à esquerda: /pagina/02 ou /pagina/abc não viram
// cópias de outras páginas.
function lerPagina(n: string): number | null {
  return /^[1-9]\d{0,5}$/.test(n) ? Number(n) : null;
}

type Params = Promise<{ loteria: string; n: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { loteria: codigoLoteria, n } = await params;
  const pagina = lerPagina(n);
  if (!isCodigoLoteriaValido(codigoLoteria) || pagina === null) return {};
  const nome = NOME_LOTERIA[codigoLoteria] ?? codigoLoteria;
  // Título, descrição e canonical próprios: sem isso o Google via as
  // páginas do histórico como duplicatas da página 1.
  const titulo = `Histórico de resultados da ${nome} — página ${pagina}`;
  const descricao = `Concursos mais antigos já sorteados da ${nome}, com dezenas, premiação por faixa e status de acumulado — página ${pagina} do histórico completo.`;
  return metadataPagina(codigoLoteria, `/resultados/pagina/${pagina}`, titulo, descricao);
}

export default async function PaginaResultadosPage({ params }: { params: Params }) {
  const { loteria: codigoLoteria, n } = await params;
  const pagina = lerPagina(n);
  if (!isCodigoLoteriaValido(codigoLoteria) || pagina === null) notFound();
  if (pagina === 1) permanentRedirect(urlPaginaResultados(codigoLoteria, 1));

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const { concursos, total } = await getConcursosPaginado(loteria.id, pagina, CONCURSOS_POR_PAGINA);
  const totalPaginas = totalPaginasResultados(total);
  if (pagina > totalPaginas) notFound();

  return (
    <>
      <TelemetriaBeacon tool="resultados" lottery={codigoLoteria} />
      <BreadcrumbJsonLd
        itens={[
          { nome: loteria.nome, caminho: `/${codigoLoteria}/resultados` },
          { nome: "Resultados", caminho: `/${codigoLoteria}/resultados` },
          { nome: `Página ${pagina}`, caminho: urlPaginaResultados(codigoLoteria, pagina) },
        ]}
      />
      <div className="container secao">
        <p className="eyebrow">{loteria.nome}</p>
        <h1 className="titulo-edicao">Histórico de resultados — página {pagina}</h1>
        <p className="subtitulo-edicao">
          Concursos mais antigos já sorteados, do mais recente para o mais antigo.
          Página {pagina} de {totalPaginas}.
        </p>

        <HistoricoConcursos
          codigoLoteria={codigoLoteria}
          concursos={concursos}
          pagina={pagina}
          totalPaginas={totalPaginas}
        />
      </div>
    </>
  );
}
