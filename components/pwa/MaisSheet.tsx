"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOTERIAS } from "@/lib/format";
import { abaAplicavel } from "@/lib/abas-loteria";
import type { CodigoLoteria } from "@/lib/types";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import { IconeFechar, IconePerfil, IconeSino } from "@/components/pwa/Icones";
import BotaoInstalar from "@/components/pwa/BotaoInstalar";

// Folha inferior ("bottom sheet") com tudo que não cabe na barra: troca de
// loteria, demais ferramentas, conteúdo editorial, conta, notificações e
// instalação. Usa <dialog> nativo com showModal(): foco preso no painel,
// Esc fecha, e no Android o gesto/botão voltar fecha o painel (CloseWatcher)
// em vez de sair da página.

const FERRAMENTAS: { slug: string; rotulo: string }[] = [
  { slug: "simulador", rotulo: "Simulador" },
  { slug: "fechamentos", rotulo: "Fechamentos" },
  { slug: "bolao", rotulo: "Bolão" },
  { slug: "analisador", rotulo: "Analisador" },
  { slug: "heatmap", rotulo: "Heatmap" },
  { slug: "probabilidades", rotulo: "Probabilidades" },
  { slug: "acumulos", rotulo: "Acúmulos" },
  { slug: "ao-vivo", rotulo: "Ao vivo" },
  { slug: "destaques", rotulo: "Destaques" },
  { slug: "tabelas", rotulo: "Tabelas" },
];

const EXPLORAR: { href: string; rotulo: string }[] = [
  { href: "/dicas", rotulo: "Dicas" },
  { href: "/matematica", rotulo: "Matemática" },
  { href: "/calculadoras", rotulo: "Calculadoras" },
  { href: "/analises", rotulo: "Análises" },
  { href: "/calendario", rotulo: "Calendário" },
  { href: "/comparador", rotulo: "Comparador" },
  { href: "/glossario", rotulo: "Glossário" },
  { href: "/perguntas-frequentes", rotulo: "Perguntas frequentes" },
  { href: "/quiz", rotulo: "Quiz" },
];

const INSTITUCIONAL: { href: string; rotulo: string }[] = [
  { href: "/sobre", rotulo: "Sobre" },
  { href: "/contato", rotulo: "Fale conosco" },
  { href: "/dicas#jogo-responsavel", rotulo: "Jogo responsável" },
  { href: "/privacidade", rotulo: "Privacidade" },
  { href: "/termos", rotulo: "Termos" },
  { href: "/api-dados", rotulo: "API de dados" },
];

export default function MaisSheet({
  aberto,
  aoFechar,
  loteria,
}: {
  aberto: boolean;
  aoFechar: () => void;
  loteria: CodigoLoteria;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const { logado, isPremium, carregando } = usePlanoUsuario();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) {
      d.showModal();
      document.documentElement.dataset.sheetAberto = "true";
    } else if (!aberto && d.open) {
      d.close();
    }
  }, [aberto]);

  // Navegou (clicou num link do painel): fecha.
  useEffect(() => {
    if (ref.current?.open) ref.current.close();
  }, [pathname]);

  const nomeLoteria = LOTERIAS[loteria].nome;

  return (
    <dialog
      ref={ref}
      className="mais-sheet"
      aria-labelledby="mais-sheet-titulo"
      onClose={() => {
        delete document.documentElement.dataset.sheetAberto;
        aoFechar();
      }}
      // Toque no fundo escurecido (fora do painel) ou em qualquer link fecha
      // — inclusive link para a página atual, que não muda o pathname.
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as Element).closest("a[href]")) ref.current?.close();
      }}
    >
      <div className="mais-sheet__painel">
        <div className="mais-sheet__alca" aria-hidden />
        <header className="mais-sheet__topo">
          <h2 id="mais-sheet-titulo" className="mais-sheet__titulo">Mais</h2>
          <button type="button" className="mais-sheet__fechar" onClick={() => ref.current?.close()} aria-label="Fechar">
            <IconeFechar />
          </button>
        </header>

        <div className="mais-sheet__conteudo">
          <div className="mais-sheet__atalhos">
            <Link href={logado ? "/conta" : "/entrar"} className="mais-sheet__atalho">
              <IconePerfil />
              <span>{carregando ? "Conta" : logado ? "Minha conta" : "Entrar"}</span>
            </Link>
            <Link href="/notificacoes" className="mais-sheet__atalho">
              <IconeSino />
              <span>Notificações</span>
            </Link>
            {!isPremium && (
              <Link href="/premium" className="mais-sheet__atalho mais-sheet__atalho--premium">
                <span aria-hidden>✦</span>
                <span>Premium</span>
              </Link>
            )}
          </div>

          <BotaoInstalar variante="cartao" />

          <section className="mais-sheet__secao" aria-labelledby="mais-loterias">
            <h3 id="mais-loterias" className="mais-sheet__rotulo">Loterias</h3>
            <div className="mais-sheet__loterias">
              {Object.values(LOTERIAS).map((l) => (
                <Link
                  key={l.slug}
                  href={`/${l.slug}/resultados`}
                  className="mais-sheet__chip"
                  data-ativo={l.slug === loteria}
                >
                  {l.nome}
                </Link>
              ))}
            </div>
          </section>

          <section className="mais-sheet__secao" aria-labelledby="mais-ferramentas">
            <h3 id="mais-ferramentas" className="mais-sheet__rotulo">Ferramentas · {nomeLoteria}</h3>
            <div className="mais-sheet__grade">
              {FERRAMENTAS.filter((f) => abaAplicavel(loteria, f.slug)).map((f) => (
                <Link key={f.slug} href={`/${loteria}/${f.slug}`} className="mais-sheet__link">
                  {f.rotulo}
                </Link>
              ))}
            </div>
          </section>

          <section className="mais-sheet__secao" aria-labelledby="mais-explorar">
            <h3 id="mais-explorar" className="mais-sheet__rotulo">Explorar</h3>
            <div className="mais-sheet__grade">
              {EXPLORAR.map((e) => (
                <Link key={e.href} href={e.href} className="mais-sheet__link">
                  {e.rotulo}
                </Link>
              ))}
            </div>
          </section>

          <nav className="mais-sheet__rodape" aria-label="Institucional">
            {INSTITUCIONAL.map((i) => (
              <Link key={i.href} href={i.href}>{i.rotulo}</Link>
            ))}
          </nav>
        </div>
      </div>
    </dialog>
  );
}
