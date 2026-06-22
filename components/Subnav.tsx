import Link from "next/link";
import { CodigoLoteria } from "@/lib/types";

export default function Subnav({
  codigoLoteria,
  ativa,
}: {
  codigoLoteria: CodigoLoteria;
  ativa:
    | "resultados"
    | "tabelas"
    | "gerador"
    | "simulador"
    | "probabilidades"
    | "fechamentos"
    | "conferidor"
    | "destaques"
    | "bolao"
    | "analisador"
    | "heatmap";
}) {
  return (
    <div className="subnav">
      <nav className="container subnav__inner">
        <Link href={`/${codigoLoteria}/resultados`} data-ativo={ativa === "resultados"}>
          Resultados
        </Link>
        <Link href={`/${codigoLoteria}/destaques`} data-ativo={ativa === "destaques"}>
          Destaques
        </Link>
        <Link href={`/${codigoLoteria}/tabelas`} data-ativo={ativa === "tabelas"}>
          Tabelas
        </Link>
        <Link href={`/${codigoLoteria}/gerador`} data-ativo={ativa === "gerador"}>
          Gerador
        </Link>
        <Link href={`/${codigoLoteria}/simulador`} data-ativo={ativa === "simulador"}>
          Simulador
        </Link>
        <Link href={`/${codigoLoteria}/fechamentos`} data-ativo={ativa === "fechamentos"}>
          Fechamentos
        </Link>
        <Link href={`/${codigoLoteria}/bolao`} data-ativo={ativa === "bolao"}>
          Bolão
        </Link>
        <Link href={`/${codigoLoteria}/conferidor`} data-ativo={ativa === "conferidor"}>
          Conferidor
        </Link>
        <Link href={`/${codigoLoteria}/analisador`} data-ativo={ativa === "analisador"}>
          Analisador
        </Link>
        <Link href={`/${codigoLoteria}/heatmap`} data-ativo={ativa === "heatmap"}>
          Heatmap
        </Link>
        <Link href={`/${codigoLoteria}/probabilidades`} data-ativo={ativa === "probabilidades"}>
          Probabilidades
        </Link>
      </nav>
    </div>
  );
}
