export interface ItemBoletim {
  loteria: string;
  numero: number;
  destaque: string;
}

/**
 * Faixa decorativa estilo wire de agência de notícias, com os últimos
 * concursos em fluxo contínuo. Puramente visual — aria-hidden porque as
 * mesmas informações já existem de forma acessível nos cards de resultado
 * logo abaixo.
 */
export default function FaixaBoletim({ itens }: { itens: ItemBoletim[] }) {
  if (itens.length === 0) return null;

  // Duplicado uma vez pra permitir o loop contínuo (translateX -50%) sem
  // deixar um vão em branco no fim de cada volta.
  const lista = [...itens, ...itens];

  return (
    <div className="faixa-boletim" aria-hidden="true">
      <div className="faixa-boletim__trilho">
        {lista.map((item, i) => (
          <span className="faixa-boletim__item" key={i}>
            {item.loteria} <strong>#{item.numero.toLocaleString("pt-BR")}</strong> · {item.destaque}
          </span>
        ))}
      </div>
    </div>
  );
}
