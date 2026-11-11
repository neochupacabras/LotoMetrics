"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { alternarLoteriaFavoritaAction } from "@/lib/favoritos-actions";
import { IcEstrela } from "@/components/membros/Icones";

// Estrela de favorito de uma loteria. Otimista: muda na hora e confirma no
// servidor; depois recarrega os dados da página (a ordem das loterias muda).
export default function BotaoFavoritoLoteria({
  codigo,
  nome,
  favorita,
  comRotulo = false,
}: {
  codigo: string;
  nome: string;
  favorita: boolean;
  comRotulo?: boolean;
}) {
  const [confirmada, setConfirmada] = useState(favorita);
  const [otimista, aplicar] = useOptimistic(confirmada, (_atual: boolean, nova: boolean) => nova);
  const [erro, setErro] = useState<string | null>(null);
  const [, iniciar] = useTransition();
  const router = useRouter();

  return (
    <span className="m-favorito">
      <button
        type="button"
        className={comRotulo ? "m-botao m-botao--secundario m-favorito__botao" : "m-ferramenta__estrela m-favorito__estrela"}
        aria-pressed={otimista}
        aria-label={comRotulo ? undefined : otimista ? `Remover ${nome} das favoritas` : `Adicionar ${nome} às favoritas`}
        title={otimista ? "Remover das favoritas" : "Adicionar às favoritas"}
        onClick={() => {
          const nova = !otimista;
          setErro(null);
          iniciar(async () => {
            aplicar(nova);
            const r = await alternarLoteriaFavoritaAction(codigo, nova);
            if (r.ok) {
              setConfirmada(r.favoritas.includes(codigo));
              router.refresh();
            } else {
              setErro(r.erro);
            }
          });
        }}
      >
        <IcEstrela cheia={otimista} />
        {comRotulo && <span>{otimista ? "Favorita" : "Favoritar"}</span>}
      </button>
      {erro && (
        <span className="m-favorito__erro" role="alert">
          {erro}
        </span>
      )}
    </span>
  );
}
