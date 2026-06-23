import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

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

  // Revalida a home e as páginas de resultados de ambas as loterias
  revalidatePath("/");
  revalidatePath("/lotofacil/resultados");
  revalidatePath("/megasena/resultados");

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
  });
}
