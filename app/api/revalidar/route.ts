import { revalidatePath, revalidateTag } from "next/cache";
import { after, NextResponse } from "next/server";
import { LOTERIAS } from "@/lib/format";
import { enviarIndexNow, urlsParaConcursos, type ConcursoNovo } from "@/lib/indexnow";
import { logJobRun } from "@/lib/telemetry";
import { aquecerUrls } from "@/lib/aquecer-cache";

// O aquecimento do cache roda em after(), depois da resposta: o prazo da
// função precisa cobrir as visitas (ver lib/aquecer-cache.ts).
export const maxDuration = 60;

// Chamado pelo importador.py (invalidar_cache_site) logo após uma
// importação que trouxe concurso novo, pra limpar o cache da home.
// Protegido por um token secreto para não ser chamado por qualquer pessoa.
//
// Uso manual:
//   curl -X POST https://lotoanalitica.com.br/api/revalidar \
//        -H "Authorization: Bearer SEU_TOKEN_AQUI"
//
// Corpo opcional (o importador manda): {"concursos": [{"loteria": "megasena",
// "numero": 2900}]}. Com ele, as URLs desses concursos, dos resultados e das
// tabelas da loteria são enviadas ao IndexNow depois da resposta.

// Lê a lista de concursos novos do corpo. Corpo vazio ou inválido = lista
// vazia: a revalidação continua funcionando como antes.
async function lerConcursos(request: Request): Promise<ConcursoNovo[]> {
  try {
    const corpo = (await request.json()) as { concursos?: unknown };
    if (!Array.isArray(corpo?.concursos)) return [];
    return corpo.concursos
      .filter((c): c is ConcursoNovo =>
        typeof c === "object" && c !== null &&
        typeof (c as ConcursoNovo).loteria === "string" &&
        typeof (c as ConcursoNovo).numero === "number")
      .slice(0, 500);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const token = process.env.REVALIDAR_SECRET;

  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const startedAt = new Date();
  const concursos = await lerConcursos(request);

  // Limpa o cache de dados (unstable_cache) usado por getUltimoConcurso e
  // getLoteriaPorCodigo em lib/queries.ts — é isso que realmente evita
  // servir resultado desatualizado, já que a maioria das rotas hoje é
  // renderizada dinamicamente (não passa pelo cache de rota do Next).
  revalidateTag("concursos", "max");
  revalidateTag("loterias", "max");

  // Revalida a home e a página de resultados de todas as 9 loterias.
  revalidatePath("/");
  for (const codigo of Object.keys(LOTERIAS)) {
    revalidatePath(`/${codigo}/resultados`);
  }

  await logJobRun({ jobName: "revalidar", status: "success", startedAt });

  // IndexNow e aquecimento depois da resposta: o importador tem timeout de
  // 10 s e uma falha aqui nunca deve virar erro da revalidação nem da
  // importação.
  const urls = urlsParaConcursos(concursos);

  // Visita as páginas que mudaram (concurso novo, hub de resultados,
  // tabelas, recordes, home) para que a próxima pessoa já as receba do
  // cache. Com revalidateTag "max", a visita recebe a versão velha e
  // dispara a regeneração com o dado novo; o concurso novo, que ainda não
  // existe no cache, é gerado na hora. Só em produção, como o IndexNow.
  if (urls.length > 0 && process.env.VERCEL_ENV === "production") {
    after(async () => {
      const inicio = new Date();
      const r = await aquecerUrls(urls);
      await logJobRun({
        jobName: "aquecer_cache",
        status: r.falhas.length === 0 && r.puladas === 0 ? "success" : "failed",
        startedAt: inicio,
        details: {
          urls: r.total,
          ok: r.ok,
          cache: r.cache,
          puladas: r.puladas,
          falhas: r.falhas.slice(0, 10),
          concursos,
        },
        error:
          r.falhas.length > 0
            ? `${r.falhas.length} de ${r.total} URLs falharam`
            : r.puladas > 0
              ? `${r.puladas} de ${r.total} URLs ficaram de fora pelo prazo`
              : null,
      });
    });
  }

  if (urls.length > 0) {
    after(async () => {
      const inicio = new Date();
      const resultado = await enviarIndexNow(urls);
      if (!resultado.enviado && resultado.motivo === "fora de produção") return;
      if (!resultado.enviado) console.error("IndexNow falhou:", resultado.motivo);
      await logJobRun({
        jobName: "indexnow",
        status: resultado.enviado ? "success" : "failed",
        startedAt: inicio,
        details: { urls: resultado.total, concursos, status: resultado.status ?? null },
        error: resultado.enviado ? null : resultado.motivo,
      });
    });
  }

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
  });
}
