import { handleProcessarConcursos } from "@/lib/notificacoes/handler-http";

export const runtime = "nodejs";
export const maxDuration = 60;

// Chamado por importador.py (invalidar_cache_site) logo após uma
// importação que trouxe concurso novo — dispara o e-mail de resultado dos
// jogos e os alertas de acúmulo no mesmo instante em que o cache do site é
// invalidado, em vez de esperar o cron diário de segurança
// (app/api/cron/conferir). Reaproveita REVALIDAR_SECRET (o importador já
// tem essa credencial) em vez de introduzir mais um secret.
//
// Uso manual:
//   curl -X POST https://lotoanalitica.com.br/api/eventos/concursos-novos \
//        -H "Authorization: Bearer SEU_TOKEN_AQUI"
export async function POST(request: Request) {
  return handleProcessarConcursos(request, "eventos_concursos_novos", process.env.REVALIDAR_SECRET);
}
