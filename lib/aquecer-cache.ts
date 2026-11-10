// Aquecimento do cache depois de cada importação (semana 6 do roadmap de
// growth). O /api/revalidar marca as páginas como velhas; sem isto, quem
// abre o concurso recém-sorteado paga a renderização inteira (4,1 s medidos
// em 10/11/2026, contra 0,36 s depois de cacheada). Aqui o próprio site
// visita as páginas que mudaram, logo depois da importação, e quem chega
// depois já encontra a página pronta.
//
// Nunca lança: devolve um resumo para quem chamou registrar em job_runs.

export interface ResultadoAquecimento {
  total: number;
  visitadas: number;
  ok: number;
  // Valor do cabeçalho x-vercel-cache (HIT, STALE, MISS...) por URL
  // visitada: mostra se a página já estava no cache ou foi gerada agora.
  cache: Record<string, number>;
  falhas: { url: string; erro: string }[];
  // URLs que ficaram de fora por estourar o prazo total.
  puladas: number;
  duracaoMs: number;
}

export interface OpcoesAquecimento {
  concorrencia?: number;
  timeoutMs?: number;
  // Prazo total: o que não começou até aqui fica de fora, para a função
  // terminar antes do maxDuration da rota.
  prazoMs?: number;
  fetchImpl?: typeof fetch;
}

export const USER_AGENT_AQUECIMENTO = "LotoAnalitica-aquecimento/1.0";

export async function aquecerUrls(
  urls: string[],
  { concorrencia = 3, timeoutMs = 15_000, prazoMs = 45_000, fetchImpl = fetch }: OpcoesAquecimento = {}
): Promise<ResultadoAquecimento> {
  const inicio = Date.now();
  const resultado: ResultadoAquecimento = {
    total: urls.length,
    visitadas: 0,
    ok: 0,
    cache: {},
    falhas: [],
    puladas: 0,
    duracaoMs: 0,
  };

  let proxima = 0;
  async function trabalhador() {
    while (proxima < urls.length) {
      const url = urls[proxima++];
      if (Date.now() - inicio > prazoMs) {
        resultado.puladas++;
        continue;
      }
      resultado.visitadas++;
      try {
        const resposta = await fetchImpl(url, {
          headers: { "User-Agent": USER_AGENT_AQUECIMENTO },
          redirect: "manual",
          signal: AbortSignal.timeout(timeoutMs),
        });
        // Lê o corpo inteiro: a página é transmitida aos poucos, e só no
        // fim a renderização terminou de fato.
        await resposta.arrayBuffer();
        const cache = resposta.headers.get("x-vercel-cache") ?? "sem-cabecalho";
        resultado.cache[cache] = (resultado.cache[cache] ?? 0) + 1;
        if (resposta.ok) resultado.ok++;
        else resultado.falhas.push({ url, erro: `HTTP ${resposta.status}` });
      } catch (err) {
        resultado.falhas.push({ url, erro: (err as Error).name === "TimeoutError" ? "timeout" : (err as Error).message });
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, Math.min(concorrencia, urls.length)) }, trabalhador));
  resultado.duracaoMs = Date.now() - inicio;
  return resultado;
}
