"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_MEMBROS, itemAtivo, type IconeNav, type ItemNav } from "@/lib/conta/navegacao";
import { gravarLocal, useLocal } from "@/lib/pwa/armazenamento";
import { limparDadosDoUsuario } from "@/lib/pwa/cliente";
import {
  IcAjuda,
  IcApi,
  IcAssinatura,
  IcBolao,
  IcCadeado,
  IcConta,
  IcDesempenho,
  IcFechar,
  IcJogos,
  IcPainel,
  IcRecolher,
  IcSair,
  IcSelo,
  IcSino,
  IcSite,
} from "@/components/membros/Icones";

const ICONES: Record<IconeNav, ComponentType<{ className?: string }>> = {
  painel: IcPainel,
  jogos: IcJogos,
  bolao: IcBolao,
  desempenho: IcDesempenho,
  assinatura: IcAssinatura,
  api: IcApi,
};

const CHAVE_RECOLHIDA = "la:lombada-recolhida";

interface Props {
  nome: string;
  email: string;
  isPremium: boolean;
  // Texto já formatado no servidor ("até 12 de dezembro de 2026"), para
  // não depender do fuso/idioma do navegador.
  validade: string | null;
  sair: () => Promise<void>;
}

// Navegação da área de membros:
//  - desktop (≥1024px): lombada escura de 248px, recolhível para 72px;
//  - tablet (641–1023px): sempre no modo trilho de ícones;
//  - celular (≤640px): barra superior compacta + barra inferior própria +
//    folha "Conta" (substituem a BottomNav pública, ver SEM_BARRA).
export default function NavMembros(props: Props) {
  const pathname = usePathname() ?? "/conta";
  const recolhida = useLocal(CHAVE_RECOLHIDA) === "1";
  const [folhaAberta, setFolhaAberta] = useState(false);

  return (
    <>
      <Lombada {...props} pathname={pathname} recolhida={recolhida} />
      <TopoCelular isPremium={props.isPremium} />
      <BarraInferior pathname={pathname} folhaAberta={folhaAberta} abrirFolha={() => setFolhaAberta(true)} />
      <FolhaConta {...props} pathname={pathname} aberta={folhaAberta} aoFechar={() => setFolhaAberta(false)} />
    </>
  );
}

function Marca() {
  return (
    <span className="m-marca">
      Loto<span>Analítica</span>
    </span>
  );
}

function SeloPlano({ isPremium, validade }: { isPremium: boolean; validade: string | null }) {
  if (isPremium) {
    return (
      <div className="m-selo-plano" data-premium="true">
        <IcSelo className="m-selo-plano__icone" />
        <span className="m-selo-plano__textos">
          <span className="m-selo-plano__nome">Premium</span>
          {validade && <span className="m-selo-plano__meta">{validade}</span>}
        </span>
      </div>
    );
  }
  return (
    <div className="m-selo-plano">
      <span className="m-selo-plano__textos">
        <span className="m-selo-plano__nome">Plano gratuito</span>
        <Link href="/premium" className="m-selo-plano__meta m-selo-plano__link">
          Conhecer o Premium
        </Link>
      </span>
    </div>
  );
}

function LinkNav({
  item,
  pathname,
  isPremium,
  className,
}: {
  item: ItemNav;
  pathname: string;
  isPremium: boolean;
  className: string;
}) {
  const Icone = ICONES[item.icone];
  const ativo = itemAtivo(item, pathname);
  const bloqueado = item.premium && !isPremium;
  return (
    <Link
      href={item.href}
      className={className}
      aria-current={ativo ? "page" : undefined}
      data-ativo={ativo}
      title={item.rotulo}
    >
      <Icone className="m-nav__icone" />
      <span className="m-nav__rotulo">{item.rotulo}</span>
      {bloqueado && (
        <span className="m-nav__cadeado" aria-label="(Premium)">
          <IcCadeado />
        </span>
      )}
    </Link>
  );
}

function BotaoSair({ sair, className, comRotulo = true }: { sair: () => Promise<void>; className: string; comRotulo?: boolean }) {
  return (
    <form action={sair} onSubmit={() => { void limparDadosDoUsuario(); }}>
      <button type="submit" className={className} title="Sair">
        <IcSair className="m-nav__icone" />
        <span className={comRotulo ? "m-nav__rotulo" : "m-sr"}>Sair</span>
      </button>
    </form>
  );
}

function Lombada({
  nome,
  email,
  isPremium,
  validade,
  sair,
  pathname,
  recolhida,
}: Props & { pathname: string; recolhida: boolean }) {
  return (
    <aside className="m-lombada" data-recolhida={recolhida} aria-label="Área de membros">
      <div className="m-lombada__topo">
        <Link href="/conta" className="m-lombada__marca" aria-label="LotoAnalítica — Painel">
          <Marca />
          <span className="m-lombada__marca-curta" aria-hidden>
            L<span>A</span>
          </span>
        </Link>
        <button
          type="button"
          className="m-lombada__recolher"
          aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
          aria-pressed={recolhida}
          onClick={() => gravarLocal(CHAVE_RECOLHIDA, recolhida ? null : "1")}
        >
          <IcRecolher />
        </button>
      </div>

      <SeloPlano isPremium={isPremium} validade={validade} />

      <nav className="m-lombada__nav" aria-label="Seções da conta">
        {NAV_MEMBROS.map((grupo, i) => (
          <div key={grupo.rotulo ?? i} className="m-lombada__grupo">
            {grupo.rotulo && <p className="m-lombada__grupo-rotulo">{grupo.rotulo}</p>}
            <ul>
              {grupo.itens.map((item) => (
                <li key={item.href}>
                  <LinkNav item={item} pathname={pathname} isPremium={isPremium} className="m-nav" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="m-lombada__base">
        <ul>
          <li>
            <Link href="/notificacoes" className="m-nav" title="Notificações">
              <IcSino className="m-nav__icone" />
              <span className="m-nav__rotulo">Notificações</span>
            </Link>
          </li>
          <li>
            <Link href="/perguntas-frequentes" className="m-nav" title="Ajuda">
              <IcAjuda className="m-nav__icone" />
              <span className="m-nav__rotulo">Ajuda</span>
            </Link>
          </li>
          <li>
            <Link href="/" className="m-nav" title="Voltar ao site">
              <IcSite className="m-nav__icone" />
              <span className="m-nav__rotulo">Voltar ao site</span>
            </Link>
          </li>
        </ul>

        <div className="m-usuario">
          <span className="m-usuario__avatar" aria-hidden>
            {nome.charAt(0).toUpperCase()}
          </span>
          <span className="m-usuario__textos">
            <span className="m-usuario__nome">{nome}</span>
            <span className="m-usuario__email">{email}</span>
          </span>
          <BotaoSair sair={sair} className="m-usuario__sair" comRotulo={false} />
        </div>
      </div>
    </aside>
  );
}

function TopoCelular({ isPremium }: { isPremium: boolean }) {
  return (
    <header className="m-topo-celular">
      <Link href="/conta" className="m-topo-celular__marca" aria-label="LotoAnalítica — Painel">
        <Marca />
      </Link>
      {isPremium && (
        <span className="m-topo-celular__selo">
          <IcSelo /> Premium
        </span>
      )}
      <Link href="/notificacoes" className="m-topo-celular__acao" aria-label="Notificações">
        <IcSino />
      </Link>
    </header>
  );
}

// Itens da barra inferior: as rotas de uso + a folha "Conta" no fim.
const ITENS_BARRA: ItemNav[] = [
  NAV_MEMBROS[0].itens[0],
  ...NAV_MEMBROS[1].itens,
];

function BarraInferior({
  pathname,
  folhaAberta,
  abrirFolha,
}: {
  pathname: string;
  folhaAberta: boolean;
  abrirFolha: () => void;
}) {
  const [tecladoAberto, setTecladoAberto] = useState(false);

  // Mesma regra da BottomNav pública: some com o teclado virtual aberto.
  useEffect(() => {
    const ehCampo = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      (el.isContentEditable ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        (el.tagName === "INPUT" &&
          !["checkbox", "radio", "button", "submit", "range", "color", "file"].includes((el as HTMLInputElement).type)));
    const aoFocar = (e: FocusEvent) => setTecladoAberto(ehCampo(e.target));
    const aoDesfocar = () => setTecladoAberto(false);
    document.addEventListener("focusin", aoFocar);
    document.addEventListener("focusout", aoDesfocar);
    return () => {
      document.removeEventListener("focusin", aoFocar);
      document.removeEventListener("focusout", aoDesfocar);
    };
  }, []);

  const contaAtiva = ["/conta/assinatura", "/conta/api"].some((p) => pathname.startsWith(p));

  return (
    <nav className="m-barra" aria-label="Navegação da conta" data-oculta={tecladoAberto}>
      <ul className="m-barra__lista">
        {ITENS_BARRA.map((item) => {
          const Icone = ICONES[item.icone];
          const ativo = itemAtivo(item, pathname) && !folhaAberta;
          return (
            <li key={item.href}>
              <Link href={item.href} className="m-barra__item" data-ativo={ativo} aria-current={ativo ? "page" : undefined}>
                <Icone />
                <span>{item.rotulo === "Jogos salvos" ? "Jogos" : item.rotulo}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            className="m-barra__item"
            data-ativo={folhaAberta || contaAtiva}
            aria-haspopup="dialog"
            aria-expanded={folhaAberta}
            onClick={abrirFolha}
          >
            <IcConta />
            <span>Conta</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

function FolhaConta({
  nome,
  email,
  isPremium,
  validade,
  sair,
  pathname,
  aberta,
  aoFechar,
}: Props & { pathname: string; aberta: boolean; aoFechar: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberta && !d.open) {
      d.showModal();
      document.documentElement.dataset.sheetAberto = "true";
    } else if (!aberta && d.open) {
      d.close();
    }
  }, [aberta]);

  useEffect(() => {
    if (ref.current?.open) ref.current.close();
  }, [pathname]);

  return (
    <dialog
      ref={ref}
      className="m-folha"
      aria-labelledby="m-folha-titulo"
      onClose={() => {
        delete document.documentElement.dataset.sheetAberto;
        aoFechar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as Element).closest("a[href]")) ref.current?.close();
      }}
    >
      <div className="m-folha__painel">
        <div className="m-folha__alca" aria-hidden />
        <header className="m-folha__topo">
          <div className="m-usuario m-usuario--claro">
            <span className="m-usuario__avatar" aria-hidden>
              {nome.charAt(0).toUpperCase()}
            </span>
            <span className="m-usuario__textos">
              <span id="m-folha-titulo" className="m-usuario__nome">{nome}</span>
              <span className="m-usuario__email">{email}</span>
            </span>
          </div>
          <button type="button" className="m-folha__fechar" onClick={() => ref.current?.close()} aria-label="Fechar">
            <IcFechar />
          </button>
        </header>

        <SeloPlano isPremium={isPremium} validade={validade} />

        <ul className="m-folha__lista">
          {NAV_MEMBROS[2].itens.map((item) => (
            <li key={item.href}>
              <LinkNav item={item} pathname={pathname} isPremium={isPremium} className="m-folha__item" />
            </li>
          ))}
          <li>
            <Link href="/notificacoes" className="m-folha__item">
              <IcSino className="m-nav__icone" />
              <span className="m-nav__rotulo">Notificações</span>
            </Link>
          </li>
          <li>
            <Link href="/perguntas-frequentes" className="m-folha__item">
              <IcAjuda className="m-nav__icone" />
              <span className="m-nav__rotulo">Ajuda</span>
            </Link>
          </li>
          <li>
            <Link href="/" className="m-folha__item">
              <IcSite className="m-nav__icone" />
              <span className="m-nav__rotulo">Voltar ao site</span>
            </Link>
          </li>
          <li>
            <BotaoSair sair={sair} className="m-folha__item m-folha__item--sair" />
          </li>
        </ul>
      </div>
    </dialog>
  );
}
