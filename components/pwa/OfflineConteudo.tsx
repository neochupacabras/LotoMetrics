"use client";

import { useEffect, useState } from "react";
import { LOTERIAS, isCodigoLoteriaValido } from "@/lib/format";

// Botão "Tentar novamente" + lista das páginas que o service worker já
// guardou neste aparelho (cache "la-paginas-*"), para o usuário seguir
// consultando o que já viu enquanto está sem conexão.

const NOMES: Record<string, string> = {
  "/": "Página inicial",
};

function rotular(caminho: string): string {
  if (NOMES[caminho]) return NOMES[caminho];
  return decodeURIComponent(caminho)
    .split("?")[0]
    .split("/")
    .filter(Boolean)
    .map((p) => (isCodigoLoteriaValido(p) ? LOTERIAS[p].nome : p.replace(/-/g, " ")))
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" › ");
}

export default function OfflineConteudo() {
  const [paginas, setPaginas] = useState<string[] | null>(null);
  const [tentando, setTentando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const nomes = (await caches.keys()).filter((n) => n.startsWith("la-paginas-"));
        const urls = new Set<string>();
        for (const n of nomes) {
          for (const req of await (await caches.open(n)).keys()) {
            const u = new URL(req.url);
            if (u.origin === location.origin && u.pathname !== "/offline") urls.add(u.pathname + u.search);
          }
        }
        setPaginas([...urls].sort());
      } catch {
        setPaginas([]);
      }
    })();
  }, []);

  function tentarDeNovo() {
    setTentando(true);
    // O service worker redireciona para /offline?de=<página pedida>: volta
    // para ela (só caminhos internos — nada de redirecionamento aberto).
    const de = new URLSearchParams(window.location.search).get("de");
    if (de && de.startsWith("/") && !de.startsWith("//") && !de.includes("\\")) {
      window.location.href = de;
    } else {
      window.location.reload();
    }
  }

  return (
    <>
      <button type="button" className="botao-gerar" onClick={tentarDeNovo} disabled={tentando}>
        {tentando ? "Tentando…" : "Tentar novamente"}
      </button>

      {paginas && paginas.length > 0 && (
        <section className="offline-salvas" aria-labelledby="offline-salvas-titulo">
          <h2 id="offline-salvas-titulo" className="offline-salvas__titulo">Disponível sem conexão</h2>
          <p className="bloco__nota">Páginas que você já abriu neste aparelho (podem estar desatualizadas):</p>
          <ul className="offline-salvas__lista">
            {paginas.map((p) => (
              <li key={p}>
                {/* <a> comum (não <Link>): navegação completa, que o service worker atende do cache. */}
                <a href={p}>{rotular(p)}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
