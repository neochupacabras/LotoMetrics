interface ItemLegenda {
  cor: "pine" | "ochre" | "rust";
  texto: string;
}

export default function Legenda({ itens, titulo }: { itens: ItemLegenda[]; titulo?: string }) {
  return (
    <div className="legenda-mapa">
      {titulo && <span className="legenda-mapa__titulo">{titulo}</span>}
      {itens.map((item, i) => (
        <span key={i} className="legenda-mapa__item">
          <span className={`legenda-mapa__ponto legenda-mapa__ponto--${item.cor}`} />
          {item.texto}
        </span>
      ))}
    </div>
  );
}
