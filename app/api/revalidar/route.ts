import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { LOTERIAS } from "@/lib/format";

// Chame este endpoint após rodar o importador.py para limpar o cache da home.
// Protegido por um token secreto para não ser chamado por qualquer pessoa.
//
// Uso:
//   curl -X POST https://lotoanalitica.com.br/api/revalidar \
//        -H "Authorization: Bearer SEU_TOKEN_AQUI"
//
// Ou no importador.py, adicione ao final:
//   import requests
//   requests.post(
//     "https://lotoanalitica.com.br/api/revalidar",
//     headers={"Authorization": f"Bearer {REVALIDAR_TOKEN}"}
//   )

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const token = process.env.REVALIDAR_SECRET;

  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

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

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
  });
}
