import Dezenas from "@/components/Dezenas";
import type { CodigoLoteria, Concurso } from "@/lib/types";

// Resultado de um concurso com os extras de cada loteria — mesmos campos
// que app/[loteria]/resultados mostra (2º sorteio, trevos, mês da sorte /
// time do coração). Super Sete é por COLUNA (um dígito de 0 a 9 em cada,
// podendo repetir), então não passa por <Dezenas>, que usa o número como key.
export default function ResultadoConcurso({ codigo, concurso }: { codigo: CodigoLoteria; concurso: Concurso }) {
  return (
    <div className="m-resultado">
      {codigo === "supersete" ? (
        <ol className="m-resultado__colunas" aria-label="Dígitos por coluna">
          {concurso.dezenas.map((d, i) => (
            <li key={i}>
              <span className="m-resultado__coluna">C{i + 1}</span>
              <span className="dezena-bola">{d}</span>
            </li>
          ))}
        </ol>
      ) : (
        <Dezenas dezenas={concurso.dezenas} />
      )}

      {concurso.dezenasSegundoSorteio && concurso.dezenasSegundoSorteio.length > 0 && (
        <div className="m-resultado__extra">
          <span className="m-resultado__rotulo">2º sorteio</span>
          <Dezenas dezenas={concurso.dezenasSegundoSorteio} />
        </div>
      )}

      {concurso.trevos && concurso.trevos.length > 0 && (
        <div className="m-resultado__extra">
          <span className="m-resultado__rotulo">Trevos</span>
          <span className="m-numero">{concurso.trevos.join(" · ")}</span>
        </div>
      )}

      {concurso.mesSorte && (
        <div className="m-resultado__extra">
          <span className="m-resultado__rotulo">{codigo === "timemania" ? "Time do Coração" : "Mês da Sorte"}</span>
          <span>{concurso.mesSorte}</span>
        </div>
      )}
    </div>
  );
}
