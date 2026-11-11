"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import {
  CATEGORIAS,
  FERRAMENTAS,
  buscarFerramentas,
  disponivelEm,
  extraPremiumEm,
  ferramentaPorId,
  hrefFerramenta,
  type CategoriaFerramenta,
  type Ferramenta,
} from "@/lib/ferramentas";
import { useRecentes } from "@/lib/ferramentas-recentes";
import { alternarFavoritoAction } from "@/lib/favoritos-actions";
import { LOTERIAS, isCodigoLoteriaValido, preposicaoLoteria } from "@/lib/format";
import { gravarLocal, useLocal } from "@/lib/pwa/armazenamento";
import type { CodigoLoteria } from "@/lib/types";
import { IcBusca, IcCadeado, IcEstrela, IcSelo } from "@/components/membros/Icones";

// Mesma chave da BottomNav pública (components/pwa/BottomNav.tsx): a
// loteria escolhida aqui é a mesma que o resto do app lembra.
const CHAVE_LOTERIA = "la:loteria";

// Só a primeira letra: preserva siglas e nomes ("CSV", "PDF", "Pro").
function minuscula(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

interface Props {
  isPremium: boolean;
  favoritosIniciais: string[];
  favoritosDisponiveis: boolean;
  loteriaSugerida: CodigoLoteria;
}

export default function CentralFerramentas({ isPremium, favoritosIniciais, favoritosDisponiveis, loteriaSugerida }: Props) {
  const lembrada = useLocal(CHAVE_LOTERIA);
  const loteria: CodigoLoteria = lembrada && isCodigoLoteriaValido(lembrada) ? lembrada : loteriaSugerida;

  const [consulta, setConsulta] = useState("");
  const [categoria, setCategoria] = useState<CategoriaFerramenta | "todas">("todas");
  const [favoritos, setFavoritos] = useState(favoritosIniciais);
  const [favoritosOtimistas, aplicarOtimista] = useOptimistic(
    favoritos,
    (atual: string[], mudanca: { id: string; favoritar: boolean }) =>
      mudanca.favoritar ? [...new Set([...atual, mudanca.id])] : atual.filter((x) => x !== mudanca.id)
  );
  const [erroFavorito, setErroFavorito] = useState<string | null>(null);
  const [, iniciar] = useTransition();
  const recentes = useRecentes();

  const filtradas = useMemo(() => {
    const porCategoria = categoria === "todas" ? FERRAMENTAS : FERRAMENTAS.filter((f) => f.categoria === categoria);
    return buscarFerramentas(consulta, porCategoria);
  }, [consulta, categoria]);

  const buscando = consulta.trim().length > 0;
  const mostrarSuas = !buscando && categoria === "todas";

  function alternar(id: string) {
    const favoritar = !favoritosOtimistas.includes(id);
    setErroFavorito(null);
    iniciar(async () => {
      aplicarOtimista({ id, favoritar });
      const r = await alternarFavoritoAction(id, favoritar);
      if (r.ok) setFavoritos(r.favoritos);
      else setErroFavorito(r.erro);
    });
  }

  const linha = (f: Ferramenta) => (
    <LinhaFerramenta
      key={f.id}
      ferramenta={f}
      loteria={loteria}
      isPremium={isPremium}
      favorita={favoritosOtimistas.includes(f.id)}
      podeFavoritar={favoritosDisponiveis}
      aoFavoritar={() => alternar(f.id)}
    />
  );

  return (
    <div className="m-central">
      <div className="m-central__controles" role="search">
        <label className="m-busca">
          <IcBusca className="m-busca__icone" />
          <span className="m-sr">Buscar ferramenta</span>
          <input
            type="search"
            className="m-busca__entrada"
            placeholder="Buscar: conferir, gerar, atraso, bolão…"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label className="m-seletor">
          <span className="m-seletor__rotulo">Loteria</span>
          <select
            className="m-seletor__entrada"
            value={loteria}
            onChange={(e) => gravarLocal(CHAVE_LOTERIA, e.target.value)}
          >
            {Object.values(LOTERIAS).map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="m-chips" role="group" aria-label="Filtrar por categoria">
        {[{ id: "todas" as const, nome: "Todas" }, ...CATEGORIAS].map((c) => (
          <button
            key={c.id}
            type="button"
            className="m-chip"
            aria-pressed={categoria === c.id}
            onClick={() => setCategoria(c.id)}
          >
            {c.nome}
          </button>
        ))}
      </div>

      {erroFavorito && (
        <p className="m-aviso" data-tipo="atencao" role="alert">
          {erroFavorito}
        </p>
      )}

      {mostrarSuas && (
        <SuasFerramentas
          favoritos={favoritosOtimistas}
          recentes={recentes.map((r) => ({ ferramenta: ferramentaPorId(r.id), loteria: r.loteria }))}
          loteria={loteria}
          podeFavoritar={favoritosDisponiveis}
        />
      )}

      <p className="m-sr" role="status" aria-live="polite">
        {buscando
          ? filtradas.length === 1
            ? "1 ferramenta encontrada"
            : `${filtradas.length} ferramentas encontradas`
          : ""}
      </p>

      {buscando ? (
        filtradas.length === 0 ? (
          <div className="m-vazio m-vazio--acao">
            <p>Nenhuma ferramenta para “{consulta.trim()}”.</p>
            <button type="button" className="m-botao m-botao--secundario" onClick={() => setConsulta("")}>
              Limpar a busca
            </button>
          </div>
        ) : (
          <section className="m-categoria" aria-label="Resultados da busca">
            <ul className="m-lista">{filtradas.map(linha)}</ul>
          </section>
        )
      ) : (
        CATEGORIAS.filter((c) => categoria === "todas" || c.id === categoria).map((c) => {
          const daCategoria = filtradas.filter((f) => f.categoria === c.id);
          if (daCategoria.length === 0) return null;
          return (
            <section key={c.id} className="m-categoria" aria-labelledby={`cat-${c.id}`}>
              <header className="m-categoria__cabecalho">
                <h2 id={`cat-${c.id}`} className="m-categoria__titulo">
                  {c.nome}
                </h2>
                <p className="m-categoria__descricao">{c.descricao}</p>
              </header>
              <ul className="m-lista">{daCategoria.map(linha)}</ul>
            </section>
          );
        })
      )}
    </div>
  );
}

function SuasFerramentas({
  favoritos,
  recentes,
  loteria,
  podeFavoritar,
}: {
  favoritos: string[];
  recentes: { ferramenta: Ferramenta | undefined; loteria: CodigoLoteria }[];
  loteria: CodigoLoteria;
  podeFavoritar: boolean;
}) {
  const fixadas = favoritos.map(ferramentaPorId).filter((f): f is Ferramenta => !!f);
  const usadas = recentes
    .filter((r): r is { ferramenta: Ferramenta; loteria: CodigoLoteria } => !!r.ferramenta)
    .slice(0, 4);

  return (
    <section className="m-suas" aria-labelledby="suas-ferramentas">
      <h2 id="suas-ferramentas" className="m-sr">
        Suas ferramentas
      </h2>
      <div className="m-suas__bloco">
        <p className="m-sobretitulo">Favoritas</p>
        {fixadas.length === 0 ? (
          <p className="m-suas__vazio">
            {podeFavoritar
              ? "Toque na estrela de uma ferramenta para fixá-la aqui — vale no celular e no computador."
              : "Favoritos indisponíveis no momento."}
          </p>
        ) : (
          <ul className="m-blocos">
            {fixadas.map((f) => (
              <li key={f.id}>
                <Link
                  href={disponivelEm(f, loteria) ? hrefFerramenta(f, loteria) : hrefFerramenta(f, "megasena")}
                  className="m-bloco"
                >
                  <span className="m-bloco__nome">{f.nome}</span>
                  <span className="m-bloco__meta">
                    {f.tipo === "loteria" ? (disponivelEm(f, loteria) ? LOTERIAS[loteria].nome : "Mega-Sena") : "Conta"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="m-suas__bloco">
        <p className="m-sobretitulo">Usadas recentemente neste aparelho</p>
        {usadas.length === 0 ? (
          <p className="m-suas__vazio">As ferramentas que você abrir aparecem aqui.</p>
        ) : (
          <ul className="m-blocos">
            {usadas.map((r) => (
              <li key={`${r.ferramenta.id}-${r.loteria}`}>
                <Link href={hrefFerramenta(r.ferramenta, r.loteria)} className="m-bloco">
                  <span className="m-bloco__nome">{r.ferramenta.nome}</span>
                  <span className="m-bloco__meta">{LOTERIAS[r.loteria]?.nome}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function LinhaFerramenta({
  ferramenta: f,
  loteria,
  isPremium,
  favorita,
  podeFavoritar,
  aoFavoritar,
}: {
  ferramenta: Ferramenta;
  loteria: CodigoLoteria;
  isPremium: boolean;
  favorita: boolean;
  podeFavoritar: boolean;
  aoFavoritar: () => void;
}) {
  const disponivel = disponivelEm(f, loteria);
  const bloqueada = f.exclusivaPremium && !isPremium;
  const extra = extraPremiumEm(f, loteria);

  const conteudo = (
    <>
      <span className="m-ferramenta__nome">
        {f.nome}
        {bloqueada && (
          <span className="m-etiqueta m-etiqueta--selo">
            <IcCadeado /> Premium
          </span>
        )}
      </span>
      <span className="m-ferramenta__descricao">
        {disponivel
          ? f.descricao
          : `Indisponível ${preposicaoLoteria(loteria).em} ${LOTERIAS[loteria].nome}: a mecânica de aposta não se encaixa.`}
      </span>
      {extra && disponivel && (
        <span className="m-ferramenta__extra">
          <IcSelo />
          {isPremium ? `Incluído no seu plano: ${minuscula(extra)}` : `Com Premium: ${minuscula(extra)}`}
        </span>
      )}
    </>
  );

  return (
    <li className="m-ferramenta" data-indisponivel={!disponivel}>
      {disponivel ? (
        <Link href={hrefFerramenta(f, loteria)} className="m-ferramenta__link">
          {conteudo}
          <span className="m-ferramenta__seta" aria-hidden>
            →
          </span>
        </Link>
      ) : (
        <div className="m-ferramenta__link" aria-disabled="true">
          {conteudo}
        </div>
      )}
      {podeFavoritar && (
        <button
          type="button"
          className="m-ferramenta__estrela"
          aria-pressed={favorita}
          aria-label={favorita ? `Remover ${f.nome} dos favoritos` : `Adicionar ${f.nome} aos favoritos`}
          title={favorita ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          onClick={aoFavoritar}
        >
          <IcEstrela cheia={favorita} />
        </button>
      )}
    </li>
  );
}
